// ============================================================
// routes/cartRoutes.js — Cart API Route Definitions
// ============================================================
// Maps HTTP methods + URL paths to the cart controller functions.
// All routes here are prefixed with /api/cart (set in server.js).
//
// Route summary:
//   GET    /api/cart/:userId                  → Get user's cart
//   POST   /api/cart/add                      → Add item to cart
//   PUT    /api/cart/update                   → Update item quantity
//   DELETE /api/cart/:userId/item/:productId  → Remove specific item
//   DELETE /api/cart/:userId                  → Clear entire cart
// ============================================================

const express = require("express");
const router = express.Router();

// Import cart controller functions
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("../controllers/cartController");

// Define routes

router.get("/:userId", getCart);                       // Fetch cart contents for a user
router.post("/add", addToCart);                        // Add a product to the cart (body: userId, productId, quantity)
router.put("/update", updateCartItem);                 // Update quantity of an item (body: userId, productId, quantity)
router.delete("/:userId/item/:productId", removeFromCart); // Remove one item from cart
router.delete("/:userId", clearCart);                  // Empty the entire cart

// Export the router for server.js
module.exports = router;
