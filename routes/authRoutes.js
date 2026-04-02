// ============================================================
// routes/authRoutes.js — Authentication API Route Definitions
// ============================================================
// Route summary:
//   POST   /api/auth/register  → Create a new account
//   POST   /api/auth/login     → Authenticate and get token
//   GET    /api/auth/me        → Get current user profile (protected)
//   DELETE /api/auth/me        → Delete account (protected)
// ============================================================

const express = require("express");
const router = express.Router();
const { register, login, getMe, deleteAccount } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.delete("/me", protect, deleteAccount);

module.exports = router;
