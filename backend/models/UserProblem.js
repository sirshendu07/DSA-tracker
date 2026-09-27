const mongoose = require('mongoose');

const userProblemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
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
    isStarred: {
      type: Boolean,
      default: undefined
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

userProblemSchema.index({ userId: 1, problemId: 1 }, { unique: true });
userProblemSchema.index({ userId: 1, status: 1 });
userProblemSchema.index({ userId: 1, revisionStatus: 1 });

module.exports = mongoose.model('UserProblem', userProblemSchema);
