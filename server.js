const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(morgan("dev"));

// API Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "EduLink API is running" });
});

app.get("/", (req, res) => {
  res.send("EduLink API is successfully running on Express!");
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Auto-seed if database is empty
  const Product = require("./models/Product");
  const User = require("./models/User");

  const productCount = await Product.countDocuments();
  const availableCount = await Product.countDocuments({ isAvailable: true });
  if (productCount === 0 || availableCount === 0) {
    console.log("No available products detected - seeding sample products...");
    if (productCount > 0) await Product.deleteMany({});
    const { sampleProducts } = require("./seeds/seedProducts");
    await Product.insertMany(sampleProducts);
    console.log(`Database seeded with ${sampleProducts.length} sample products!`);
  }

  // Seed default admin if none exists
  const adminExists = await User.findOne({ role: "admin" });
  if (!adminExists) {
    await User.create({
      name: "Admin",
      email: "admin@sliit.lk",
      password: "admin123",
      role: "admin",
    });
    console.log("Default admin created - email: admin@sliit.lk / password: admin123");
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
};

startServer();
