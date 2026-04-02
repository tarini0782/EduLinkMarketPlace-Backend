// ============================================================
// controllers/cartController.js — Shopping Cart Operations
// ============================================================
// From Tarini's backend. Handles cart retrieval, add/update/remove
// items, and clearing the cart.
// ============================================================

const Cart = require("../models/Cart");
const Product = require("../models/Product");

/**
 * GET /api/cart/:userId
 * Retrieve a user's cart with full product details and calculated total.
 */
const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId }).populate("items.product");

    if (!cart) {
      return res.json({ userId, items: [], totalAmount: 0 });
    }

    const totalAmount = cart.items.reduce((sum, item) => {
      if (item.product) {
        return sum + item.product.price * item.quantity;
      }
      return sum;
    }, 0);

    res.json({
      userId: cart.userId,
      items: cart.items,
      totalAmount: Math.round(totalAmount * 100) / 100,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to get cart", error: error.message });
  }
};

/**
 * POST /api/cart/add
 * Add an item to the user's cart.
 * Request body: { userId, productId, quantity }
 */
const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity = 1 } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: "userId and productId are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (!product.isAvailable) {
      return res.status(400).json({ message: "Product is no longer available" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ product: productId, quantity }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ userId }).populate("items.product");

    const totalAmount = updatedCart.items.reduce((sum, item) => {
      if (item.product) {
        return sum + item.product.price * item.quantity;
      }
      return sum;
    }, 0);

    res.status(200).json({
      message: "Item added to cart",
      cart: {
        userId: updatedCart.userId,
        items: updatedCart.items,
        totalAmount: Math.round(totalAmount * 100) / 100,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add to cart", error: error.message });
  }
};

/**
 * PUT /api/cart/update
 * Update the quantity of a specific item in the cart.
 * Request body: { userId, productId, quantity }
 */
const updateCartItem = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    if (!userId || !productId || quantity === undefined) {
      return res
        .status(400)
        .json({ message: "userId, productId, and quantity are required" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ userId }).populate("items.product");

    const totalAmount = updatedCart.items.reduce((sum, item) => {
      if (item.product) {
        return sum + item.product.price * item.quantity;
      }
      return sum;
    }, 0);

    res.json({
      message: "Cart updated",
      cart: {
        userId: updatedCart.userId,
        items: updatedCart.items,
        totalAmount: Math.round(totalAmount * 100) / 100,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update cart", error: error.message });
  }
};

/**
 * DELETE /api/cart/:userId/item/:productId
 * Remove a specific item from the user's cart.
 */
const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );

    await cart.save();

    const updatedCart = await Cart.findOne({ userId }).populate("items.product");

    const totalAmount = updatedCart.items.reduce((sum, item) => {
      if (item.product) {
        return sum + item.product.price * item.quantity;
      }
      return sum;
    }, 0);

    res.json({
      message: "Item removed from cart",
      cart: {
        userId: updatedCart.userId,
        items: updatedCart.items,
        totalAmount: Math.round(totalAmount * 100) / 100,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove item", error: error.message });
  }
};

/**
 * DELETE /api/cart/:userId
 * Clear all items from the user's cart.
 */
const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.json({ message: "Cart cleared", cart: { userId, items: [], totalAmount: 0 } });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear cart", error: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
