// ============================================================
// models/Order.js — Order Schema (Mongoose Model)
// ============================================================
// From Sahlaan's backend. Includes payment status fields:
//   status: ["Awaiting Payment", "Confirmed", "Delivered", "Cancelled"]
//   paymentStatus: ["pending", "paid", "failed", "refunded"]
//
// Orders start with status "Awaiting Payment" and paymentStatus "pending".
// The payment endpoint updates these after successful payment.
// ============================================================

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String, default: "" },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Awaiting Payment", "Confirmed", "Delivered", "Cancelled"],
      default: "Awaiting Payment",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderType: {
      type: String,
      enum: ["buy-now", "cart-checkout"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
