const submitForm = document.querySelector("#connect_form");

submitForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.querySelector("#name").value;
    const email = document.querySelector("#email").value;
    const message = document.querySelector("#message").value;

    try{
        const res = await fetch("https://portfolio-contact-api-64q0.onrender.com/api/contact", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({name, email, message}),
        });

        const data = await res.json();

        if (!data.ok){
            alert(data.error || "Something went wrong");
            return;
        }

        alert("Message sent! please check you email.");
        submitForm.reset();
    } catch (err) {
        alert("Could not send message. Server maybe offline.");
    }


});