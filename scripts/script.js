document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 JavaScript Loaded!"); 

    const loginForm = document.getElementById('login-form');

    if (!loginForm) {
        console.error("❌ Error: Login form not found!");
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        console.log("📩 Sending login request...");

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log("📩 Response:", data);

            if (response.ok) {
                console.log("✅ Storing user data in localStorage...");
                localStorage.setItem("token", data.token);
                localStorage.setItem("name", data.name);
                localStorage.setItem("email", data.email);

                alert(data.message);
                window.location.href = "dashboard.html"; 
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("❌ Error:", error);
            alert("Something went wrong! Please try again.");
        }
    });
});