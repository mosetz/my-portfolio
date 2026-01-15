import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();

const allowedOrigins = [
    "https://mosetz.github.io/my-portfolio/",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
]

/**
 * Allow frontend to call this backend
 */
app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ['content-type'],
}));

app.options("/*", cors());

/**
 * Prase JSON bodies (so req.body work)
 */
app.use(express.json());

// Health check route (quick test)
app.get("/", (req, res) => {
    res.send("Contact API is running");
});

app.post("/api/contact", async (req, res) => {

    try {
        const {name, email, message} = req.body;

        //step 1 basic validation 
        if(!name || !email || !message){
            return res.status(400).json({ok: false, error: "Missing field" });
        }

        //simple email validate check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ok: false, error: "Invalid email."});
        }

        //step2 Create transporter (Gmail)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD,
            },
        });

        // step3 Email to me
        const mailToYou = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO,
            subject: `New contact form message from ${name}`,
            replyTo: email,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage: ${message}`,
        };

        //step 4 Email to user
        const mailToUser = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Thanks for contacting me!",
            text: `Hi ${name}, \n\nThanks for reaching out - I received your message and will get back to you soon. \n\nYour message:\n"${message}"\n\nBest regards, \nSarit Samkumpim`,
        };

        await transporter.sendMail(mailToYou);
        await transporter.sendMail(mailToUser);

        return res.json({ok: true, message: "Email sent successfully"});
    }catch (err) {
        console.error(err);
        return res.status(500).json({ok: false, message:"Server error."});
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));