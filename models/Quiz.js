// ============================================================
// models/Quiz.js — Quiz Schema (Mongoose Model)
// ============================================================
// From Dinuja's backend. Defines quizzes with questions,
// options, correct answers, and time limits.
// ============================================================

const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a quiz title']
  },
  module: {
    type: String,
    required: [true, 'Please add the module name']
  },
  description: String,
  timeLimit: {
    type: Number,
    required: true,
    default: 30
  },
  questions: [{
    questionText: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: String,
      required: true
    },
    points: {
      type: Number,
      default: 1
    }
  }],
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);
