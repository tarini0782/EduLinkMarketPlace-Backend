// ============================================================
// controllers/authController.js — Authentication Operations
// ============================================================
// From Tarini's backend. Handles user registration, login,
// profile retrieval, and account deletion. Issues JWT tokens.
//
// Route summary:
//   POST   /api/auth/register  → Create a new account
//   POST   /api/auth/login     → Authenticate and get token
//   GET    /api/auth/me        → Get current user's profile
//   DELETE /api/auth/me        → Delete current user's account
// ============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "sliit-marketplace-secret-key";

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
};

/**
 * POST /api/auth/register
 * Create a new user account.
 */
const register = async (req, res) => {
  try {
    const { name, email, password, studentId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = await User.create({ name, email, password, studentId });

    const token = generateToken(user);

    res.status(201).json({
      message: "Registration successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({ message: "Registration failed", error: error.message });
  }
};

/**
 * POST /api/auth/login
 * Authenticate user and return token.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

/**
 * GET /api/auth/me
 * Get current logged-in user's profile.
 */
const getMe = async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      studentId: req.user.studentId,
      role: req.user.role,
    },
  });
};

/**
 * DELETE /api/auth/me
 * Delete the current user's account and all their product listings.
 */
const deleteAccount = async (req, res) => {
  try {
    const Product = require("../models/Product");

    // Remove all products listed by this user
    await Product.deleteMany({ sellerId: req.user._id.toString() });

    // Remove the user account
    await User.findByIdAndDelete(req.user._id);

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete account", error: error.message });
  }
};

module.exports = { register, login, getMe, deleteAccount };
