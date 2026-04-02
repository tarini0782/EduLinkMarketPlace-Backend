// ============================================================
// middleware/auth.js — Authentication & Authorization Middleware
// ============================================================
// From Tarini's backend.
// protect  — Verifies JWT token and attaches user to req.user
// adminOnly — Restricts access to users with role "admin"
// ============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "sliit-marketplace-secret-key";

/**
 * Middleware: protect
 * Verifies the JWT token from the Authorization header.
 * Attaches the user object to req.user for downstream handlers.
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized — no token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized — user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized — invalid token" });
  }
};

/**
 * Middleware: adminOnly
 * Must be used AFTER protect. Checks that req.user has the "admin" role.
 */
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = { protect, adminOnly };
