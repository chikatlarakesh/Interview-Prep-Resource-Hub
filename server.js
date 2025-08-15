const express = require("express"); // Importing Express framework
const mongoose = require("mongoose"); // Importing Mongoose to connect to MongoDB
const dotenv = require("dotenv"); // To use environment variables from .env file
const cors = require("cors"); // To allow frontend to connect
const path = require("path"); // For handling file paths
const authRoutes = require("./routes/authRoutes"); // Importing authentication routes
const userRoutes = require("./routes/userRoutes"); // Importing user-related routes
const resourceRoutes = require("./routes/resourceRoutes"); // Importing resource routes
const webhookRoutes = require("./routes/webhookRoutes"); // Importing webhook routes
const resourcesRouter = require("./routes/resources"); // Importing resources router
const adminRoutes = require("./routes/adminRoutes"); // Importing admin routes

dotenv.config(); // Load variables from .env

const app = express(); // Initialize Express app

app.use(cors()); // Enables Cross-Origin Resource Sharing
app.use(express.json()); // Allows backend to accept JSON data (like from frontend forms)

// API Routes
app.use("/api/auth", authRoutes); // Mount authentication routes under /api/auth
app.use("/api/user", userRoutes); // Mount user routes under /api/user
app.use("/api", resourceRoutes); // Mount resource routes under /api
app.use("/api", webhookRoutes); // Mount webhook routes under /api
app.use("/api/resources", resourcesRouter); // Mount resources router under /api/resources
app.use("/api/admin", adminRoutes); // Mount admin routes under /api/admin

// Serve static files from the React app build directory
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "frontend/dist")));
  
  // Catch all handler: send back React's index.html file for any non-API routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
  });
} else {
  // Test Route for development
  app.get("/", (req, res) => {
    res.send("API is running...");
  });
}

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection failed:", err));

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 


