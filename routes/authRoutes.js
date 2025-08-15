const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // Mongoose User model

const router = express.Router(); // Create a new Express router instance

// Import middleware for admin authorization
const { isAdmin } = require("../middleware/authMiddleware");

const jwt = require("jsonwebtoken");

// Function to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, isAdmin: user.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// ✅ Route: GET all users (Admin-only access)
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    // Fetch all users, but exclude their passwords for security
    const users = await User.find({}, { password: 0 });
    res.status(200).json(users); // Send the list of users as response
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Server error" }); // Send generic error message
  }
});

// ✅ Route: Register a new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, isAdmin } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user instance
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      isAdmin: isAdmin || false,
    });

    // Save user to the database
    await newUser.save();

    // Generate token for immediate login
    const token = generateToken(newUser);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
    });
  } catch (error) {
    console.error("Error in register route:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// ✅ Route: Login a user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`Login attempt for non-existent user: ${email}`);
      return res.status(404).json({ message: "User not found" });
    }

    // Compare provided password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`Login attempt with invalid credentials for user: ${email}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user);
    console.log(`User ${email} logged in successfully, token generated.`);

    // Success - send user object (without password ideally in real apps)
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error("Error in login route:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// Export the router to use in main app
module.exports = router;


