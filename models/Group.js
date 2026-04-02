// ============================================================
// models/Group.js — Study Group Schema (Mongoose Model)
// ============================================================
// From Dinuja's backend. Defines study groups with leader,
// members, capacity, tags, and status.
// ============================================================

const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a group name'],
    unique: true,
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject/module']
  },
  leader: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }],
  capacity: {
    type: Number,
    required: true,
    default: 4,
    max: [10, 'Capacity cannot exceed 10 members']
  },
  tags: [String],
  description: String,
  status: {
    type: String,
    enum: ['open', 'full', 'closed'],
    default: 'open'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Group', groupSchema);
