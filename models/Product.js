// ============================================================
// models/Product.js — Product Schema (Mongoose Model)
// ============================================================
// From Tarini's marketplace. Defines a product listing for the
// SLIIT student marketplace (textbooks, electronics, etc.).
// ============================================================

const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    image: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Textbooks",
        "Electronics",
        "Stationery",
        "Clothing",
        "Food & Drinks",
        "Services",
        "Other",
      ],
    },
    sellerId: {
      type: String,
      required: [true, "Seller ID is required"],
    },
    sellerName: {
      type: String,
      required: [true, "Seller name is required"],
    },
    condition: {
      type: String,
      enum: ["New", "Like New", "Used - Good", "Used - Fair"],
      default: "Used - Good",
    },
    stock: {
      type: Number,
      default: 1,
      min: [0, "Stock cannot be negative"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
