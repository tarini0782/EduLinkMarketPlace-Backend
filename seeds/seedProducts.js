// ============================================================
// seeds/seedProducts.js — Sample Product Data & Seeding Script
// ============================================================
// Contains 10 sample product listings for the SLIIT Marketplace.
// These products span different categories to demonstrate the app's
// filtering and browsing features.
//
// This file serves two purposes:
//   1. It's imported by server.js to auto-seed an empty database on startup
//   2. It can be run directly to seed a MongoDB instance:
//      node seeds/seedProducts.js
// ============================================================

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("../models/Product");

// Load .env variables (needed when running this file directly)
dotenv.config();

// Array of sample products — each one follows the Product schema
const sampleProducts = [
  {
    name: "Data Structures & Algorithms Textbook",
    description:
      "Cormen et al. (CLRS) - Introduction to Algorithms, 4th Edition. Used for SE2020. Highlighted but in great condition.",
    price: 3500,
    category: "Textbooks",
    sellerId: "student001",
    sellerName: "Kamal Perera",
    condition: "Used - Good",
    stock: 1,
    image: "",
  },
  {
    name: "Scientific Calculator (Casio fx-991EX)",
    description:
      "Barely used Casio scientific calculator. Needed for math modules in Year 1 & 2.",
    price: 4200,
    category: "Electronics",
    sellerId: "student002",
    sellerName: "Nimesha Silva",
    condition: "Like New",
    stock: 1,
    image: "",
  },
  {
    name: "Arduino Starter Kit",
    description:
      "Complete Arduino Uno starter kit with breadboard, LEDs, resistors, sensors, and jumper wires. Perfect for embedded systems module.",
    price: 5500,
    category: "Electronics",
    sellerId: "student003",
    sellerName: "Dinesh Fernando",
    condition: "New",
    stock: 3,
    image: "",
  },
  {
    name: "SLIIT Hoodie - Size M",
    description:
      "Official SLIIT hoodie, navy blue, size M. Worn twice, still looks brand new.",
    price: 2000,
    category: "Clothing",
    sellerId: "student004",
    sellerName: "Tharushi Jayawardena",
    condition: "Like New",
    stock: 1,
    image: "",
  },
  {
    name: "A4 Lecture Notebooks (Pack of 5)",
    description:
      "Brand new pack of 5 A4 ruled notebooks. 200 pages each. CR quality paper.",
    price: 750,
    category: "Stationery",
    sellerId: "student002",
    sellerName: "Nimesha Silva",
    condition: "New",
    stock: 10,
    image: "",
  },
  {
    name: "Web Development Bootcamp Notes",
    description:
      "Complete handwritten notes covering HTML, CSS, JavaScript, React, Node.js. Based on IT2030 and self-study.",
    price: 1500,
    category: "Stationery",
    sellerId: "student001",
    sellerName: "Kamal Perera",
    condition: "Used - Good",
    stock: 1,
    image: "",
  },
  {
    name: "Homemade Chocolate Chip Cookies (12 pack)",
    description:
      "Freshly baked chocolate chip cookies! Made to order. Pick up from Malabe campus canteen area.",
    price: 600,
    category: "Food & Drinks",
    sellerId: "student005",
    sellerName: "Sachini Bandara",
    condition: "New",
    stock: 20,
    image: "",
  },
  {
    name: "Resume Review Service",
    description:
      "I'll review and improve your CV/resume for internship and job applications. 3+ years of freelancing experience. Turnaround: 2 days.",
    price: 1000,
    category: "Services",
    sellerId: "student006",
    sellerName: "Ravindu Wickramasinghe",
    condition: "New",
    stock: 99,
    image: "",
  },
  {
    name: "Logitech Wireless Mouse",
    description:
      "Logitech M185 wireless mouse. Battery life is still excellent. Selling because I switched to a trackpad.",
    price: 1800,
    category: "Electronics",
    sellerId: "student004",
    sellerName: "Tharushi Jayawardena",
    condition: "Used - Good",
    stock: 1,
    image: "",
  },
  {
    name: "Software Engineering Principles (PDF Notes)",
    description:
      "Digital copy of comprehensive SE notes covering all SE3020 topics. Will email the PDF after purchase.",
    price: 500,
    category: "Textbooks",
    sellerId: "student003",
    sellerName: "Dinesh Fernando",
    condition: "New",
    stock: 99,
    image: "",
  },
];

/**
 * seedDB — Standalone seeding function
 * Connects directly to MongoDB, clears all products, and inserts the sample data.
 * Only used when running this file directly (not when imported by server.js).
 */
const seedDB = async () => {
  try {
    require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear all existing products from the database
    await Product.deleteMany({});
    console.log("Cleared existing products");

    // Insert all sample products in one batch operation
    const inserted = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${inserted.length} sample products`);

    // Print a summary of what was seeded
    console.log("\nSample products:");
    inserted.forEach((p) => {
      console.log(`  - ${p.name} (Rs. ${p.price}) [${p.category}]`);
    });

    await mongoose.disconnect();
    console.log("\nDone! Database seeded successfully.");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
};

// If this file is run directly (e.g., "node seeds/seedProducts.js"), execute the seed function
// If it's imported by another file (e.g., server.js), just export the data
if (require.main === module) {
  seedDB();
}

// Export the sample products array so server.js can use it for auto-seeding
module.exports = { sampleProducts };
