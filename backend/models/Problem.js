const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema(
  {
    problemNumber: {
      type: Number,
      index: true
    },
    sheetIndex: {
      type: Number,
      default: 1,
      index: true
    },
    sheet: {
      type: String,
      required: true,
      index: true
    },
    topic: {
      type: String,
      required: true,
      index: true
    },
    subtopic: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
      index: true
    },
    url: {
      type: String,
      required: true
    },
    isFaangCore: {
      type: Boolean,
      default: false,
      index: true
    },
    isStarred: {
      type: Boolean,
      default: false,
      index: true
    },
    status: {
      type: String,
      enum: ['Todo', 'In Progress', 'Done'],
      default: 'Todo',
      index: true
    },
    revisionStatus: {
      type: String,
      enum: ['None', 'Need Revise', 'One Time Revision', 'Mastered'],
      default: 'None',
      index: true
    },
    notes: {
      type: String,
      default: ''
    },
    solvedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for fast filtering and searching
problemSchema.index({ sheet: 1, topic: 1 });
problemSchema.index({ status: 1, revisionStatus: 1 });
problemSchema.index({ title: 'text', topic: 'text', notes: 'text' });

module.exports = mongoose.model('Problem', problemSchema);
