const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Temporary in-memory storage for users (replace with a database in production)
const users = [];

// Secret key for JWT
const JWT_SECRET_KEY = "your_secret_key";

// Sign-up endpoint
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).send("Username and password are required.");
    }

    // Check if user already exists
    const existingUser = users.find((u) => u.username === username);
    if (existingUser) {
      return res.status(409).send("User already exists.");
    }

    // Hash password and store user
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    res.status(201).send("User registered successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Login endpoint
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).send("Username and password are required.");
    }

    // Find user
    const user = users.find((u) => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send("Invalid credentials");
    }

    // Generate JWT token
    const token = jwt.sign({ username }, JWT_SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Protected endpoint to fetch resources
app.get("/resources", (req, res) => {
  const authHeader = req.headers.authorization;

  // Check for authorization header
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Unauthorized");
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify JWT token
    jwt.verify(token, JWT_SECRET_KEY);

    // Fetch files from the Interview Prep folder
    const repoPath = path.resolve(__dirname, "../Interview Prep");
    if (!fs.existsSync(repoPath)) {
      return res.status(404).send("Resource folder not found.");
    }

    const files = fs.readdirSync(repoPath);
    res.json({ resources: files });
  } catch (error) {
    console.error(error);
    res.status(401).send("Invalid or expired token.");
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
