// ============================================================
// controllers/orderController.js — Order Processing Logic
// ============================================================
// From Sahlaan's backend. Handles order creation and retrieval:
//   - buyNow: Instantly buy a single product (skips the cart)
//   - checkout: Buy everything in the user's cart at once
//   - getOrders: Retrieve a user's order history
//   - getOrderById: Get details of a specific order
//   - processPayment: Update order status to Confirmed and paymentStatus to paid
//
// Orders start with status "Awaiting Payment" / paymentStatus "pending".
// Stock is NOT deducted at order creation — the payment endpoint handles that.
// ============================================================

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

/**
 * POST /api/orders/buy-now
 * Instantly purchase a single product (bypasses the cart).
 * Request body: { userId, productId, quantity }
 */
const buyNow = async (req, res) => {
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
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    const totalAmount = product.price * quantity;
    const order = new Order({
      userId,
      items: [
        {
          product: product._id,
          name: product.name,
          price: product.price,
          quantity,
          image: product.image,
        },
      ],
      totalAmount: Math.round(totalAmount * 100) / 100,
      orderType: "buy-now",
    });

    await order.save();

    res.status(201).json({
      message: "Order placed successfully!",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to place order", error: error.message });
  }
};

/**
 * POST /api/orders/checkout
 * Purchase everything in the user's shopping cart.
 * Request body: { userId }
 */
const checkout = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const cart = await Cart.findOne({ userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      if (!item.product) {
        return res
          .status(400)
          .json({ message: "A product in your cart no longer exists" });
      }
      if (!item.product.isAvailable) {
        return res.status(400).json({
          message: `"${item.product.name}" is no longer available`,
        });
      }
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for "${item.product.name}". Available: ${item.product.stock}`,
        });
      }

      orderItems.push({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
      });

      totalAmount += item.product.price * item.quantity;
    }

    const order = new Order({
      userId,
      items: orderItems,
      totalAmount: Math.round(totalAmount * 100) / 100,
      orderType: "cart-checkout",
    });

    await order.save();

    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Checkout successful! Order placed.",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to checkout", error: error.message });
  }
};

/**
 * GET /api/orders/:userId
 * Retrieve all orders for a specific user (order history).
 */
const getOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Failed to get orders", error: error.message });
  }
};

/**
 * GET /api/orders/detail/:orderId
 * Retrieve a single order by its ID.
 */
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Failed to get order", error: error.message });
  }
};

/**
 * POST /api/orders/:orderId/pay
 * Process payment for an order.
 * Updates order status to "Confirmed" and paymentStatus to "paid".
 * Also deducts stock from products and marks them unavailable if stock reaches 0.
 */
const processPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order has already been paid" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Cannot pay for a cancelled order" });
    }

    // Deduct stock for each item in the order
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
        if (product.stock === 0) {
          product.isAvailable = false;
        }
        await product.save();
      }
    }

    // Update order status
    order.status = "Confirmed";
    order.paymentStatus = "paid";
    await order.save();

    res.json({
      message: "Payment processed successfully!",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to process payment", error: error.message });
  }
};

/**
 * PUT /api/orders/:orderId/cancel
 * Cancel an order. Only allowed if the order hasn't been paid yet.
 */
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Cannot cancel a paid order" });
    }

    order.status = "Cancelled";
    order.paymentStatus = "failed";
    await order.save();

    res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to cancel order", error: error.message });
  }
};

module.exports = { buyNow, checkout, getOrders, getOrderById, processPayment, cancelOrder };
