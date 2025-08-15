// Import the Mongoose library for MongoDB modeling
const mongoose = require("mongoose");

// Define the schema for the User model
const userSchema = new mongoose.Schema({

  // User's full name
  name: {
    type: String,
    required: true, // Name is mandatory
  },

  // User's email address
  email: {
    type: String,
    required: true, // Email is mandatory
    unique: true,   // Ensures no duplicate emails exist
  },

  // User's password (will be stored as a hashed string)
  password: {
    type: String,
    required: true,
  },

  // Flag to identify if the user has admin privileges
  isAdmin: {
    type: Boolean,
    default: false, // By default, every user is not an admin
  }

}, { 
  // Automatically adds `createdAt` and `updatedAt` timestamps
  timestamps: true 
});

// Export the model to use in controllers and route files
module.exports = mongoose.model("User", userSchema);


