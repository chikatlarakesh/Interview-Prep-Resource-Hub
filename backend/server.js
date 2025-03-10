require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// ✅ Ensure required environment variables exist
const requiredEnvVars = [
    "JWT_SECRET", "DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME",
    "GITHUB_USERNAME", "GITHUB_REPO"
];
requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
        console.error(`🚨 Missing required environment variable: ${varName}`);
        process.exit(1);
    }
});

// ✅ MySQL Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err);
        return;
    }
    console.log("✅ Connected to MySQL Database.");
});

// ✅ Middleware to Verify JWT Token
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Access Denied. No token provided." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: "Invalid or expired token." });
        }
        req.user = user;
        next();
    });
}

// ✅ User Signup Route
app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Please provide name, email, and password" });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (result.length > 0) return res.status(400).json({ error: "Email already exists" });

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", 
                [name, email, hashedPassword], 
                (err) => {
                    if (err) return res.status(500).json({ error: "Database insertion error" });
                    res.status(201).json({ message: "User registered successfully!" });
                });
        } catch (error) {
            res.status(500).json({ error: "Error hashing password" });
        }
    });
});

// ✅ User Login Route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Please provide email and password" });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (result.length === 0) return res.status(401).json({ error: "Invalid credentials" });

        const user = result[0];

        try {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

            // ✅ Generate JWT token
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );

            res.json({
                token, 
                name: user.name, 
                email: user.email, 
                message: "Login successful"
            });

        } catch (error) {
            res.status(500).json({ error: "Error processing login request" });
        }
    });
});

// ✅ Protected Route: Dashboard
app.get("/dashboard", authenticateToken, (req, res) => {
    res.json({ message: "Welcome to the Dashboard!", user: req.user });
});

// ✅ Logout Route (Frontend Should Remove Token)
app.post("/logout", (req, res) => {
    res.json({ message: "Logged out successfully!" });
});

// ✅ Profile Update Route
app.post("/update-profile", authenticateToken, (req, res) => {
    const { name, email } = req.body;
    const userId = req.user.id;

    if (!name || !email) {
        return res.status(400).json({ error: "Please provide a name and email" });
    }

    db.query("UPDATE users SET name = ?, email = ? WHERE id = ?", 
        [name, email, userId], 
        (err) => {
            if (err) return res.status(500).json({ error: "Database update error" });
            res.json({ message: "Profile updated successfully!" });
        }
    );
});

// ✅ Route to Fetch GitHub Resources (Including Subfolders)
app.get("/resources", async (req, res) => {
    try {
        const githubApiUrl = `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPO}/contents/`;
        console.log(`🔍 Fetching from GitHub: ${githubApiUrl}`);

        async function fetchFiles(url) {
            const response = await axios.get(url, {
                headers: { "Accept": "application/vnd.github.v3+json" }
            });

            let files = [];
            for (let file of response.data) {
                if (file.type === "dir") {
                    // ✅ If it's a folder, fetch its contents recursively
                    const subFiles = await fetchFiles(file.url);
                    files = files.concat(subFiles);
                } else if (file.type === "file") {
                    files.push({ name: file.name, url: file.download_url });
                }
            }
            return files;
        }

        const resources = await fetchFiles(githubApiUrl);
        console.log("✅ GitHub Resources Fetched:", resources);
        res.json({ resources });

    } catch (error) {
        console.error("❌ Error fetching GitHub resources:", error.message || error);
        res.status(500).json({ error: "Failed to fetch resources from GitHub" });
    }
});

// ✅ Start Server on Port from `.env`
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

// ✅ Fetch GitHub Resources and Categorize Them
app.get("/resources", async (req, res) => {
    try {
        const githubApiUrl = `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPO}/contents/`;
        console.log(`🔍 Fetching from GitHub: ${githubApiUrl}`);

        const response = await axios.get(githubApiUrl, {
            headers: { 
                "Accept": "application/vnd.github.v3+json",
                "Authorization": `token ${process.env.GITHUB_TOKEN}` // Add this line
            }
        });

        if (!Array.isArray(response.data)) {
            throw new Error("Unexpected GitHub API response format.");
        }

        // ✅ Extract file names and links
        const resources = response.data
            .filter(file => file.type === "file")
            .map(file => ({
                name: file.name,
                url: file.download_url
            }));

        console.log("✅ GitHub Resources Fetched:", resources);

        res.json({ resources });

    } catch (error) {
        console.error("❌ Error fetching GitHub resources:", error.message || error);
        res.status(500).json({ error: "Failed to fetch resources from GitHub" });
    }
});

