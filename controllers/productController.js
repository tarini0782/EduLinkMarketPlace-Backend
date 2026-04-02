// ============================================================
// controllers/productController.js — Product CRUD Operations
// ============================================================
// From Tarini's backend. Handles product listing, retrieval,
// creation, update, and deletion with search/filter support.
// ============================================================

const Product = require("../models/Product");

/**
 * GET /api/products
 * Fetch all available products, with optional filtering.
 * Query params: ?category=Electronics&search=arduino&sellerId=student001
 */
const getProducts = async (req, res) => {
  try {
    const { category, search, sellerId } = req.query;

    const filter = { isAvailable: true };

    if (category) {
      filter.category = category;
    }
    if (sellerId) {
      filter.sellerId = sellerId;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: "Failed to get products", error: error.message });
  }
};

/**
 * GET /api/products/:id
 * Fetch a single product by its MongoDB _id.
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: "Failed to get product", error: error.message });
  }
};

/**
 * POST /api/products
 * Create a new product listing.
 */
const createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      sellerId: req.user._id.toString(),
      sellerName: req.user.name,
    };

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      message: "Product listed successfully!",
      product,
    });
  } catch (error) {
    res.status(400).json({ message: "Failed to create product", error: error.message });
  }
};

/**
 * PUT /api/products/:id
 * Update an existing product listing. Only the owner can update.
 */
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.sellerId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this product" });
    }

    Object.assign(product, req.body);
    await product.save();

    res.json({ message: "Product updated", product });
  } catch (error) {
    res.status(400).json({ message: "Failed to update product", error: error.message });
  }
};

/**
 * DELETE /api/products/:id
 * Delete a product listing. Only the owner can delete.
 */
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.sellerId !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this product" });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
