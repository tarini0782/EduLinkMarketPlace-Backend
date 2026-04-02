// ============================================================
// config/db.js — MongoDB Connection Logic
// ============================================================
// Connects to MongoDB Atlas using the MONGO_URI environment variable.
// ============================================================

const mongoose = require("mongoose");

/**
 * connectDB — Establishes the MongoDB connection
 * Uses MONGO_URI from .env (Dinuja's MongoDB Atlas cluster)
 */
const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      console.error("MONGO_URI is not defined in .env");
      process.exit(1);
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
