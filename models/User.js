// ============================================================
// models/User.js — Merged User Schema (Mongoose Model)
// ============================================================
// Merged from Tarini's marketplace user (name, email, password,
// studentId, role with bcrypt) and Dinuja's student profile fields
// (campus, degreeProgram, year, semester, skills, hasGroup,
// groupName, bio, profilePhoto).
//
// Uses Tarini's pre-save hook and comparePassword method.
// Role enum includes both "user" and "admin".
// ============================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    studentId: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // --- Dinuja's student profile fields ---
    campus: {
      type: String,
      default: "Malabe",
    },
    degreeProgram: String,
    skills: [String],
    year: String,
    semester: String,
    hasGroup: String,
    groupName: String,
    bio: String,
    profilePhoto: String,
  },
  { timestamps: true }
);

// Hash password before saving (Mongoose 9+ does not pass next to async hooks)
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
