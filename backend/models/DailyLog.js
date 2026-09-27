const mongoose = require('mongoose');

const dailyLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true
    },
    dayOfWeek: {
      type: Number, // 0 = Sun, 1 = Mon, ..., 6 = Sat
      required: true
    },
    isWeekend: {
      type: Boolean,
      default: false
    },
    target: {
      type: Number,
      default: 5
    },
    solvedCount: {
      type: Number,
      default: 0
    },
    targetMet: {
      type: Boolean,
      default: false
    },
    problemIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem'
      }
    ]
  },
  {
    timestamps: true
  }
);

dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyLog', dailyLogSchema);
