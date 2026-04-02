// ============================================================
// routes/productRoutes.js — Product API Route Definitions
// ============================================================
// Maps HTTP methods + URL paths to the corresponding controller functions.
// All routes here are prefixed with /api/products (set in server.js).
//
// Route summary:
//   GET    /api/products          → List all products (with optional filters)
//   GET    /api/products/:id      → Get a single product by ID
//   POST   /api/products          → Create a new product listing
//   PUT    /api/products/:id      → Update an existing product
//   DELETE /api/products/:id      → Delete a product
// ============================================================

const express = require("express");
const router = express.Router(); // Create a mini router for product-related routes

// Import the controller functions that contain the actual logic
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect } = require("../middleware/auth");

// Define routes — Express matches these top-to-bottom

// Public routes (no login required)
router.get("/", getProducts);          // GET /api/products?category=Electronics&search=arduino
router.get("/:id", getProductById);    // GET /api/products/6651a3b2f1... (MongoDB ObjectId)

// Protected routes (login required)
router.post("/", protect, createProduct);       // POST /api/products (with JSON body)
router.put("/:id", protect, updateProduct);     // PUT /api/products/6651a3b2f1... (with JSON body)
router.delete("/:id", protect, deleteProduct);  // DELETE /api/products/6651a3b2f1...

// Export the router so server.js can mount it at /api/products
module.exports = router;
