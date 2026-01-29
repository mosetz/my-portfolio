import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Resend } from 'resend';
import pool from './db.js'

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY)

const app = express();

const allowedOrigins = [
    "https://mosetz.github.io",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
]

/**
 * Allow frontend to call this backend
 */
app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"]
}));


/**
 * Prase JSON bodies (so req.body work)
 */
app.use(express.json());


// Health check route (quick test)
app.get("/", (req, res) => {
    res.send("Contact API is running");
});

//get table info from db
app.get("/api/recommendations", async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, message, created_at
            FROM public.recommendations
            ORDER BY created_at DESC
            LIMIT 20`
        );
        return res.json({ok:true, data: result.rows});
    }catch (err){
        console.error("GET /api/recommendations error:", err);
        return res.status(500).json({ok:false, error: err.message});
    }
});

app.post("/api/recommendations", async (req, res) => {
    try {
        
        const {name, message} = req.body;
        
        //simple validation 
        if (!message || !message.trim().length === 0) {
            return res.status(400).json({ok: false, error: "Message is required"});
        }

        //limit message length to prevent spam / huge payload
        if (message.length > 500) {
            return res.status(400).json({ok: false, error: "Message too long (max 500)"});
        }

        const safeName = name && name.trim().length > 0 ? name.trim() : null;

        const insertResult = await pool.query (
            `INSERT INTO public.recommendations (name, message)
            VALUES ($1, $2)
            RETURNING id, name, message, created_at`,
            [safeName, message]
        );

        return res.status(201).json({ok: true, data: insertResult.rows[0]});

    } catch (err) {
        console.error("POST /api/recommendations error:", err);
        return res.status(500).json({ok: false, error: err.message})
    }
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

        //step2 email to me
       const toYou = await resend.emails.send({
            from: "Portfolio Contact <onboarding@resend.dev>",
            to: process.env.EMAIL_TO,
            subject: `New contact form message from ${name}`,
            replyTo: email,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage: ${message}`,
       });

       if (toYou.error){
            console.error("Resend toYou error:", toYou.error);
            return res.status(500).json({ok: false, error: "Failed to send message to owner." })
       }

        // step3 Email to user (confirmation)
       const toUser = await resend.emails.send({
            from: "Mos <onboarding@resend.dev>",
            to: email,
            subject: "Thanks for contacting me!",
            text:
                `Hi ${name},\n\n` +
                `Thanks for reaching out — I received your message and will get back to you soon.\n\n` +
                `Your message:\n"${message}"\n\n` +
                `Best regards,\nSarit Samkumpim`,
       });

       if (toUser.error) {
            console.error("Resend toUser error:", toUser.error);
            return res.status(200).json({ ok: true, message: "Message received. Confirmation email unavailable." });
       }
        
    
        return res.json({ok: true, message: "Email sent successfully"});
    }catch (err) {
        console.error(err);
        return res.status(500).json({ok: false, message:"Server error."});
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));