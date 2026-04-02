// ============================================================
// controllers/adminController.js — Merged Admin Operations
// ============================================================
// Combines Tarini's admin CRUD (stats, users, products management)
// with Dinuja's admin analytics (login, dashboard summary,
// marketplace analytics, quiz analytics, student progress,
// pending products, product approval).
// ============================================================

const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Quiz = require("../models/Quiz");
const Result = require("../models/Result");

// ===================== Tarini's Admin CRUD =====================

/**
 * GET /api/admin/stats
 * Dashboard summary statistics.
 */
const getStats = async (req, res) => {
  try {
    const [userCount, productCount, orderCount] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
    ]);

    res.json({ stats: { users: userCount, products: productCount, orders: orderCount } });
  } catch (error) {
    res.status(500).json({ message: "Failed to load stats", error: error.message });
  }
};

/**
 * GET /api/admin/users
 * List all registered users (excluding passwords).
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Failed to load users", error: error.message });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Delete a user and all their product listings.
 * Admins cannot delete themselves.
 */
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot delete your own admin account" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await Product.deleteMany({ sellerId: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: `User "${user.name}" deleted` });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

/**
 * PUT /api/admin/users/:id/role
 * Change a user's role (user <-> admin).
 */
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role must be 'user' or 'admin'" });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: `Role updated to "${role}"`, user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update role", error: error.message });
  }
};

/**
 * GET /api/admin/products
 * List ALL products (including unavailable ones).
 */
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Failed to load products", error: error.message });
  }
};

/**
 * DELETE /api/admin/products/:id
 * Admin can delete any product.
 */
const adminDeleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ message: `Product "${product.name}" deleted` });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};

// ===================== Dinuja's Admin Analytics =====================

/**
 * POST /api/admin/login
 * Admin login (Dinuja's endpoint with demo bypass).
 */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide email and password" });
    }

    // Demo bypass for quick testing
    if (email === "admin@gmail.com" && password === "admin12345") {
      return res.status(200).json({
        success: true,
        message: "Admin logged in successfully (Instant Bypass Mode)",
        admin: {
          id: "mock_admin_123",
          name: "Demo Admin",
          email: "admin@gmail.com",
          role: "admin",
        },
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied. Admin only." });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully",
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error during login", error: error.message });
  }
};

/**
 * GET /api/admin/dashboard-summary
 * Full dashboard summary with student count, products, quizzes, and performance.
 */
const getDashboardSummary = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: { $in: ["student", "user"] } });
    const totalProducts = await Product.countDocuments();
    const totalQuizzes = await Quiz.countDocuments();
    const totalQuizAttempts = await Result.countDocuments();

    const avgStudentPerformance = await Result.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: { $divide: ["$score", "$total"] } },
        },
      },
    ]);

    const recentActivity = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalProducts,
        totalQuizzes,
        totalQuizAttempts,
        avgStudentPerformance:
          avgStudentPerformance.length > 0
            ? (avgStudentPerformance[0].avgScore * 100).toFixed(2) + "%"
            : "0%",
        recentActivity,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching dashboard summary", error: error.message });
  }
};

/**
 * GET /api/admin/analytics/marketplace
 * Marketplace analytics: product counts, category breakdown, revenue.
 */
const getMarketplaceAnalytics = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const approvedProducts = await Product.countDocuments({ isAvailable: true });
    const soldProducts = await Product.countDocuments({ isAvailable: false });

    const categoryBreakdown = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = await Order.aggregate([
      {
        $match: { paymentStatus: "paid" },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);

    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        approvedProducts,
        soldProducts,
        categoryBreakdown,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        recentProducts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching marketplace analytics", error: error.message });
  }
};

/**
 * GET /api/admin/analytics/quizzes
 * Quiz analytics: total quizzes, attempts, performance, difficulty, score distribution.
 */
const getQuizAnalytics = async (req, res) => {
  try {
    const totalQuizzes = await Quiz.countDocuments();
    const totalAttempts = await Result.countDocuments();

    const quizPerformance = await Result.aggregate([
      {
        $group: {
          _id: "$quiz",
          averageScore: { $avg: "$score" },
          attempts: { $sum: 1 },
          totalPoints: { $avg: "$total" },
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "_id",
          as: "quizInfo",
        },
      },
      {
        $unwind: "$quizInfo",
      },
      {
        $sort: { attempts: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    const difficultyAnalysis = await Result.aggregate([
      {
        $group: {
          _id: "$quiz",
          avgScore: { $avg: { $divide: ["$score", "$total"] } },
          attempts: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "_id",
          foreignField: "_id",
          as: "quiz",
        },
      },
      {
        $unwind: "$quiz",
      },
    ]);

    const scoreDistribution = await Result.aggregate([
      {
        $bucket: {
          groupBy: { $divide: ["$score", "$total"] },
          boundaries: [0, 0.2, 0.4, 0.6, 0.8, 1.0],
          default: "Other",
          output: {
            count: { $sum: 1 },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalQuizzes,
        totalAttempts,
        quizPerformance,
        difficultyAnalysis,
        scoreDistribution,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching quiz analytics", error: error.message });
  }
};

/**
 * GET /api/admin/student-progress
 * Student progress reports with quiz results.
 */
const getStudentProgress = async (req, res) => {
  try {
    const students = await User.find({ role: { $in: ["student", "user"] } });

    const studentProgress = await Promise.all(
      students.map(async (student) => {
        const results = await Result.find({ student: student._id }).populate(
          "quiz",
          "title module"
        );

        const totalQuizzesAttempted = results.length;
        const averageScore =
          results.length > 0
            ? (
                (results.reduce((sum, r) => sum + r.score / r.total, 0) /
                  results.length) *
                100
              ).toFixed(2)
            : 0;

        const recentResults = results
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);

        return {
          studentId: student._id,
          name: student.name,
          email: student.email,
          campus: student.campus,
          degreeProgram: student.degreeProgram,
          totalQuizzesAttempted,
          averageScore,
          recentResults,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: studentProgress,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching student progress", error: error.message });
  }
};

/**
 * GET /api/admin/products/pending
 * Get marketplace products pending approval.
 */
const getPendingProducts = async (req, res) => {
  try {
    const pendingProducts = await Product.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: pendingProducts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching pending products", error: error.message });
  }
};

/**
 * PUT /api/admin/products/:id/approve
 * Approve or reject a marketplace product.
 * Request body: { approval: "approved" | "rejected" }
 */
const approveProduct = async (req, res) => {
  try {
    const { approval } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    product.isAvailable = approval === "approved";
    await product.save();

    res.status(200).json({
      success: true,
      message: `Product ${approval}`,
      data: product,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error approving product", error: error.message });
  }
};

module.exports = {
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
};
