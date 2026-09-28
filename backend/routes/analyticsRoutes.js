const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const UserProblem = require('../models/UserProblem');
const DailyLog = require('../models/DailyLog');
const { optionalAuth } = require('../middleware/auth');

function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// GET analytics dashboard metrics with optional user context
router.get('/', optionalAuth, async (req, res) => {
  try {
    const today = new Date();
    const todayStr = getLocalDateString(today);
    const dayOfWeek = today.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const userId = req.user ? req.user.userId : null;

    const totalProblems = await Problem.countDocuments();
    let solvedProblems = 0;
    let inProgressProblems = 0;
    let starredCount = 0;
    let needReviseCount = 0;
    let oneTimeReviseCount = 0;
    let masteredCount = 0;

    let solvedProblemIds = new Set();
    let needReviseIds = new Set();

    if (userId) {
      const userProblems = await UserProblem.find({ userId }).lean();
      userProblems.forEach((up) => {
        if (up.status === 'Done') {
          solvedProblems++;
          solvedProblemIds.add(up.problemId.toString());
        } else if (up.status === 'In Progress') {
          inProgressProblems++;
        }

        if (up.revisionStatus === 'Need Revise') {
          needReviseCount++;
          needReviseIds.add(up.problemId.toString());
        } else if (up.revisionStatus === 'One Time Revision') {
          oneTimeReviseCount++;
        } else if (up.revisionStatus === 'Mastered') {
          masteredCount++;
        }

        if (up.isStarred) starredCount++;
      });
    } else {
      solvedProblems = await Problem.countDocuments({ status: 'Done' });
      inProgressProblems = await Problem.countDocuments({ status: 'In Progress' });
      starredCount = await Problem.countDocuments({ isStarred: true });
      needReviseCount = await Problem.countDocuments({ revisionStatus: 'Need Revise' });
      oneTimeReviseCount = await Problem.countDocuments({ revisionStatus: 'One Time Revision' });
      masteredCount = await Problem.countDocuments({ revisionStatus: 'Mastered' });
    }

    const faangCoreCount = await Problem.countDocuments({ isFaangCore: true });

    const todoProblems = Math.max(0, totalProblems - solvedProblems - inProgressProblems);

    // 2. Difficulty breakdown
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const difficultyStats = await Promise.all(
      difficulties.map(async (diff) => {
        const total = await Problem.countDocuments({ difficulty: diff });
        let solved = 0;
        if (userId) {
          const diffProblems = await Problem.find({ difficulty: diff }).select('_id').lean();
          solved = diffProblems.filter((dp) => solvedProblemIds.has(dp._id.toString())).length;
        } else {
          solved = await Problem.countDocuments({ difficulty: diff, status: 'Done' });
        }
        return {
          difficulty: diff,
          total,
          solved,
          percentage: total > 0 ? Math.round((solved / total) * 100) : 0
        };
      })
    );

    // 3. Sheet breakdown
    const sheets = ['Top 300 FAANG Roadmap', 'Advanced 200 (Trees, Graphs, DP)'];
    const sheetStats = await Promise.all(
      sheets.map(async (sheet) => {
        const total = await Problem.countDocuments({ sheet });
        let solved = 0;
        if (userId) {
          const sheetProbs = await Problem.find({ sheet }).select('_id').lean();
          solved = sheetProbs.filter((sp) => solvedProblemIds.has(sp._id.toString())).length;
        } else {
          solved = await Problem.countDocuments({ sheet, status: 'Done' });
        }
        return {
          sheet,
          total,
          solved,
          percentage: total > 0 ? Math.round((solved / total) * 100) : 0
        };
      })
    );

    // 4. Topic breakdown
    const masterTopics = await Problem.aggregate([
      {
        $group: {
          _id: '$topic',
          sheet: { $first: '$sheet' },
          total: { $sum: 1 },
          problemIds: { $push: '$_id' },
          easy: { $sum: { $cond: [{ $eq: ['$difficulty', 'Easy'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$difficulty', 'Medium'] }, 1, 0] } },
          hard: { $sum: { $cond: [{ $eq: ['$difficulty', 'Hard'] }, 1, 0] } }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const topicStats = masterTopics.map((t) => {
      let solved = 0;
      let needRevise = 0;
      if (userId) {
        t.problemIds.forEach((id) => {
          const strId = id.toString();
          if (solvedProblemIds.has(strId)) solved++;
          if (needReviseIds.has(strId)) needRevise++;
        });
      } else {
        // guest mode
        solved = 0;
      }

      return {
        topic: t._id,
        sheet: t.sheet,
        total: t.total,
        solved,
        percentage: t.total > 0 ? Math.round((solved / t.total) * 100) : 0,
        easy: t.easy,
        medium: t.medium,
        hard: t.hard,
        needRevise
      };
    });

    // 5. Daily Goal, LeetCode-style Heatmap & History
    const allUserLogs = await DailyLog.find({ userId })
      .populate('problemIds', 'problemNumber title difficulty topic url')
      .sort({ date: 1 })
      .lean();

    const logMap = new Map();
    allUserLogs.forEach((l) => {
      logMap.set(l.date, l);
    });

    let todayLog = logMap.get(todayStr);
    if (!todayLog) {
      const newToday = new DailyLog({
        userId,
        date: todayStr,
        dayOfWeek,
        isWeekend,
        target: 5,
        solvedCount: 0,
        targetMet: false
      });
      await newToday.save();
      todayLog = newToday.toObject();
      logMap.set(todayStr, todayLog);
    }

    // Past 14 Days for backwards compatibility
    const pastDays = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = getLocalDateString(d);
      const dow = d.getDay();
      const isWk = dow === 0 || dow === 6;

      let log = logMap.get(dStr);
      pastDays.push({
        date: dStr,
        day: DAYS[dow],
        dayOfWeek: dow,
        isWeekend: isWk,
        target: isWk ? 0 : 5,
        solvedCount: log ? log.solvedCount : 0,
        targetMet: isWk ? true : log ? log.targetMet : false
      });
    }

    // Generate 52 Weeks (~365 days) Heatmap aligned to Sunday start
    const heatmapDays = [];
    const todayDayOfWeek = today.getDay(); // 0 = Sun ... 6 = Sat
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (52 * 7 + todayDayOfWeek));

    let totalActiveDays = 0;
    let totalHeatmapSolved = 0;
    let maxStreak = 0;
    let curStreakCounter = 0;

    const loopDate = new Date(startDate);
    while (loopDate <= today) {
      const dStr = getLocalDateString(loopDate);
      const dow = loopDate.getDay();
      const isWk = dow === 0 || dow === 6;
      const log = logMap.get(dStr);
      const count = log ? log.solvedCount : 0;
      const targetMet = isWk ? (count >= 5) : (log ? log.targetMet : false);

      if (count > 0) {
        totalActiveDays++;
        totalHeatmapSolved += count;
      }

      if (!isWk) {
        if (targetMet || count >= 5) {
          curStreakCounter++;
          if (curStreakCounter > maxStreak) maxStreak = curStreakCounter;
        } else {
          curStreakCounter = 0;
        }
      } else if (count >= 5) {
        curStreakCounter++;
        if (curStreakCounter > maxStreak) maxStreak = curStreakCounter;
      }

      heatmapDays.push({
        date: dStr,
        dayOfWeek: dow,
        isWeekend: isWk,
        count,
        targetMet: log ? log.targetMet : false,
        problems: log && log.problemIds ? log.problemIds.map(p => ({
          _id: p._id,
          problemNumber: p.problemNumber,
          title: p.title,
          difficulty: p.difficulty,
          topic: p.topic,
          url: p.url
        })) : []
      });

      loopDate.setDate(loopDate.getDate() + 1);
    }

    // 6. Calculate Current Streak (Saturday & Sunday Off rule)
    let streak = 0;
    let checkDate = new Date();

    if (!isWeekend && todayLog.targetMet) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (isWeekend && todayLog.solvedCount >= 5) {
      streak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    let searchDays = 180;
    while (searchDays > 0) {
      const dow = checkDate.getDay();
      const isWk = dow === 0 || dow === 6;
      const dStr = getLocalDateString(checkDate);

      if (isWk) {
        checkDate.setDate(checkDate.getDate() - 1);
        searchDays--;
        continue;
      }

      const log = logMap.get(dStr);
      if (log && (log.targetMet || log.solvedCount >= 5)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
        searchDays--;
      } else {
        break;
      }
    }
    maxStreak = Math.max(maxStreak, streak);

    // 7. Full History of Solved Problems grouped by date
    const history = allUserLogs
      .filter((l) => l.solvedCount > 0)
      .map((l) => ({
        date: l.date,
        dayOfWeek: l.dayOfWeek,
        dayName: DAYS[l.dayOfWeek],
        isWeekend: l.isWeekend,
        solvedCount: l.solvedCount,
        targetMet: l.targetMet,
        problems: (l.problemIds || []).map((p) => ({
          _id: p._id,
          problemNumber: p.problemNumber,
          title: p.title,
          difficulty: p.difficulty,
          topic: p.topic,
          url: p.url
        }))
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    res.json({
      success: true,
      data: {
        summary: {
          total: totalProblems,
          solved: solvedProblems,
          inProgress: inProgressProblems,
          todo: todoProblems,
          percentage: totalProblems > 0 ? Math.round((solvedProblems / totalProblems) * 100) : 0,
          starred: starredCount,
          faangCore: faangCoreCount,
          needRevise: needReviseCount,
          oneTimeRevise: oneTimeReviseCount,
          mastered: masteredCount
        },
        dailyGoal: {
          todayDate: todayStr,
          dayName: DAYS[dayOfWeek],
          isWeekend,
          dailyTarget: 5,
          todaySolved: todayLog.solvedCount,
          targetMet: todayLog.targetMet,
          streak,
          maxStreak,
          message: isWeekend
            ? 'Weekend Off (Rest & Revision Day) - Free practice!'
            : todayLog.targetMet
            ? '🔥 5/5 Target Completed Today! Fantastic job!'
            : `${5 - todayLog.solvedCount} more problems to reach today\'s FAANG target!`
        },
        difficulties: difficultyStats,
        sheets: sheetStats,
        topics: topicStats,
        recentActivity: pastDays,
        heatmap: {
          days: heatmapDays,
          totalActiveDays,
          totalSolved: totalHeatmapSolved,
          currentStreak: streak,
          maxStreak
        },
        history
      }
    });
  } catch (error) {
    console.error('Error computing analytics:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
