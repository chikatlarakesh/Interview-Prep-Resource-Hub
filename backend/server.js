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
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

const requiredEnvVars = [
  "JWT_SECRET", "DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME",
  "GITHUB_USERNAME", "GITHUB_REPO", "GITHUB_TOKEN"
];
requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    console.error(`🚨 Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

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

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    console.log("🔎 Auth Header:", authHeader);
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      console.log("🚨 No token provided");
      return res.status(401).json({ error: "Access Denied. No token provided." });
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error("🚨 JWT verification failed:", err);
        return res.status(403).json({ error: "Invalid or expired token." });
      }
      console.log("✅ Token Verified, user data:", user);
      req.user = user;
      next();
    });
  }  

app.post("/signup", async (req, res) => {
  const { name, email, password, dob, mobile, pincode, subject_interest } = req.body;
  if (!name || !email || !password || !dob || !mobile || !pincode || !subject_interest)
    return res.status(400).json({ error: "Please provide all fields" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length > 0) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    db.query("INSERT INTO users (name, email, password, dob, mobile, pincode, subject_interest) VALUES (?, ?, ?, ?, ?, ?, ?)", 
      [name, email, hashedPassword, dob, mobile, pincode, subject_interest],
      (err) => {
        if (err) return res.status(500).json({ error: "Database insertion error" });
        res.status(201).json({ message: "User registered successfully!" });
      }
    );
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Please provide email and password" });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, name: user.name, email: user.email, message: "Login successful" });
  });
});

app.post("/forgot-password", async (req, res) => {
  const { email, dob, newPassword } = req.body;
  if (!email || !dob || !newPassword)
    return res.status(400).json({ error: "Please provide email, date of birth, and new password" });

  db.query("SELECT * FROM users WHERE email = ? AND dob = ?", [email, dob], async (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length === 0)
      return res.status(404).json({ error: "No matching user found or DOB is incorrect" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email], (err) => {
      if (err) return res.status(500).json({ error: "Error updating password" });
      res.json({ message: "✅ Password updated successfully!" });
    });
  });
});

app.get("/dashboard", authenticateToken, (req, res) => {
    const userId = req.user.id;
    db.query(
      "SELECT name, email, dob, mobile, pincode, subject_interest, created_at FROM users WHERE id = ?",
      [userId],
      (err, result) => {
        if (err) {
          console.error("❌ Database error while fetching dashboard user info:", err);
          return res.status(500).json({ error: "Database error" });
        }
        if (result.length === 0) {
          console.warn(`⚠️ No user found in DB with id = ${userId}`);
          return res.status(404).json({ error: "User not found" });
        }
        console.log("✅ User data fetched from DB:", result[0]);
        res.json({ user: result[0] });
      }
    );  
  });  

app.post("/logout", (req, res) => {
  res.json({ message: "Logged out successfully!" });
});

app.post("/update-profile", authenticateToken, (req, res) => {
    const { name, email, dob, mobile, pincode, subject_interest } = req.body;
    const userId = req.user.id;
  
    console.log("➡️ Update request received with data:", { name, email, dob, mobile, pincode, subject_interest, userId });
  
    if (!name || !email || !dob || !mobile || !pincode || !subject_interest) {
      return res.status(400).json({ error: "Please provide all fields" });
    }
  
    db.query(
      "UPDATE users SET name = ?, email = ?, dob = ?, mobile = ?, pincode = ?, subject_interest = ? WHERE id = ?",
      [name, email, dob, mobile, pincode, subject_interest, userId],
      (err) => {
        if (err) {
          console.error("❌ Database update error:", err);
          return res.status(500).json({ error: "Database update error" });
        }
        res.json({ message: "Profile updated successfully!" });
      }
    );
  });  
 
app.get("/resources", async (req, res) => {
  try {
    const githubApiUrl = `https://api.github.com/repos/${process.env.GITHUB_USERNAME}/${process.env.GITHUB_REPO}/contents/`;
    const response = await axios.get(githubApiUrl, {
      headers: { 
        "Accept": "application/vnd.github.v3+json",
        "Authorization": `token ${process.env.GITHUB_TOKEN}`
      }
    });

    const resources = response.data
      .filter(file => file.type === "file")
      .map(file => ({ name: file.name, url: file.download_url }));

    res.json({ resources });

  } catch (error) {
    res.status(500).json({ error: "Failed to fetch resources from GitHub" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
