const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  // Tarini's admin CRUD
  getStats,
  getUsers,
  deleteUser,
  updateUserRole,
  getAllProducts,
  adminDeleteProduct,
  // Dinuja's admin analytics
  adminLogin,
  getDashboardSummary,
  getMarketplaceAnalytics,
  getQuizAnalytics,
  getStudentProgress,
  getPendingProducts,
  approveProduct,
} = require("../controllers/adminController");

// Dinuja's admin login (no auth required)
router.post("/login", adminLogin);

// All remaining admin routes require authentication + admin role
router.use(protect, adminOnly);

// Tarini's admin CRUD
router.get("/stats", getStats);
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/role", updateUserRole);
router.get("/products", getAllProducts);
router.delete("/products/:id", adminDeleteProduct);

// Dinuja's admin analytics
router.get("/dashboard-summary", getDashboardSummary);
router.get("/analytics/marketplace", getMarketplaceAnalytics);
router.get("/analytics/quizzes", getQuizAnalytics);
router.get("/student-progress", getStudentProgress);
router.get("/products/pending", getPendingProducts);
router.put("/products/:id/approve", approveProduct);

module.exports = router;
