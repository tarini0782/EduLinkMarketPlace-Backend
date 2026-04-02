// ============================================================
// models/JoinRequest.js — Group Join Request Schema (Mongoose Model)
// ============================================================
// From Dinuja's backend. Tracks requests to join study groups.
// ============================================================

const mongoose = require('mongoose');

const joinRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: mongoose.Schema.ObjectId,
    ref: 'Group',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    required: [true, 'Please provide a message specifying why you want to join']
  }
}, {
  timestamps: true
});

// Prevent same user from requesting same group multiple times
joinRequestSchema.index({ user: 1, group: 1 }, { unique: true });

module.exports = mongoose.model('JoinRequest', joinRequestSchema);
