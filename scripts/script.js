document.addEventListener("DOMContentLoaded", function() {
    console.log("🚀 JavaScript Loaded!"); 

    const loginForm = document.getElementById('login-form');

    if (!loginForm) {
        console.error("❌ Error: Login form not found!");
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        console.log("📩 Sending login request...");

        try {
            // Clear any old tokens before login
            localStorage.removeItem("token");
            localStorage.removeItem("name");
            localStorage.removeItem("email");

            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log("📩 Response:", data);

            if (response.ok) {
                console.log("✅ Login successful. Storing user data in localStorage...");
                console.log("✅ Token received on login:", data.token);
                localStorage.setItem("token", data.token);
                localStorage.setItem("name", data.name);
                localStorage.setItem("email", data.email);

                alert(data.message);
                window.location.href = "dashboard.html"; 
            } else {
                alert(data.error || "Login failed. Please check your credentials.");
            }
        } catch (error) {
            console.error("❌ Network Error:", error);
            alert("Something went wrong! Please check your internet connection and try again.");
        }
    });
});