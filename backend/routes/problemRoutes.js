const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const UserProblem = require('../models/UserProblem');
const DailyLog = require('../models/DailyLog');
const { optionalAuth, requireAuth } = require('../middleware/auth');

function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// GET all problems with optional user personalization
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { sheet, topic, difficulty, status, revisionStatus, isStarred, search } = req.query;
    const userId = req.user ? req.user.userId : null;

    const baseQuery = {};

    if (sheet && sheet !== 'all') {
      baseQuery.sheet = sheet;
    }

    if (topic && topic !== 'all') {
      baseQuery.topic = topic;
    }

    if (difficulty && difficulty !== 'all') {
      baseQuery.difficulty = difficulty;
    }

    if (search && search.trim()) {
      const term = search.trim();
      baseQuery.$or = [
        { title: { $regex: term, $options: 'i' } },
        { topic: { $regex: term, $options: 'i' } },
        { notes: { $regex: term, $options: 'i' } }
      ];
    }

    // If guest and filter is set on master problem
    if (!userId) {
      if (status && status !== 'all') baseQuery.status = status;
      if (revisionStatus && revisionStatus !== 'all') baseQuery.revisionStatus = revisionStatus;
      if (isStarred === 'true') baseQuery.isStarred = true;

      const problems = await Problem.find(baseQuery)
        .sort({ problemNumber: 1, createdAt: 1 })
        .lean();

      return res.json({
        success: true,
        count: problems.length,
        data: problems
      });
    }

    // Authenticated User: fetch master problems and overlay user's personal progress
    const masterProblems = await Problem.find(baseQuery)
      .sort({ problemNumber: 1, createdAt: 1 })
      .lean();

    const userProblems = await UserProblem.find({ userId }).lean();
    const userProgressMap = new Map();
    userProblems.forEach((up) => {
      userProgressMap.set(up.problemId.toString(), up);
    });

    // Merge personal progress into problem list
    let merged = masterProblems.map((p) => {
      const up = userProgressMap.get(p._id.toString());
      return {
        ...p,
        status: up ? up.status : 'Todo',
        revisionStatus: up ? up.revisionStatus : 'None',
        notes: up && up.notes !== undefined ? up.notes : (p.notes || ''),
        isStarred: up && typeof up.isStarred === 'boolean' ? up.isStarred : Boolean(p.isStarred),
        solvedAt: up ? up.solvedAt : null
      };
    });

    // Apply user-specific filters
    if (status && status !== 'all') {
      merged = merged.filter((p) => p.status === status);
    }

    if (revisionStatus && revisionStatus !== 'all') {
      merged = merged.filter((p) => p.revisionStatus === revisionStatus);
    }

    if (isStarred === 'true') {
      merged = merged.filter((p) => p.isStarred === true);
    }

    res.json({
      success: true,
      count: merged.length,
      data: merged
    });
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET single problem by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id).lean();
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    if (req.user) {
      const up = await UserProblem.findOne({ userId: req.user.userId, problemId: problem._id }).lean();
      if (up) {
        problem.status = up.status;
        problem.revisionStatus = up.revisionStatus;
        problem.notes = up.notes;
        problem.isStarred = up.isStarred;
        problem.solvedAt = up.solvedAt;
      }
    }

    res.json({ success: true, data: problem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH update problem
router.patch('/:id', optionalAuth, async (req, res) => {
  try {
    const { status, revisionStatus, notes, isStarred } = req.body;
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const todayStr = getLocalDateString();
    const today = new Date();
    const dayOfWeek = today.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const userId = req.user ? req.user.userId : null;

    if (userId) {
      // 1. User is authenticated: update or create UserProblem
      let up = await UserProblem.findOne({ userId, problemId: problem._id });
      if (!up) {
        up = new UserProblem({
          userId,
          problemId: problem._id,
          status: 'Todo',
          revisionStatus: 'None',
          notes: '',
          isStarred: problem.isStarred
        });
      }

      const oldStatus = up.status;

      if (status !== undefined && status !== oldStatus) {
        up.status = status;
        if (status === 'Done') {
          up.solvedAt = new Date();

          let daily = await DailyLog.findOne({ userId, date: todayStr });
          if (!daily) {
            daily = new DailyLog({
              userId,
              date: todayStr,
              dayOfWeek,
              isWeekend,
              target: 5,
              solvedCount: 1,
              problemIds: [problem._id]
            });
          } else {
            const alreadyLogged = daily.problemIds.some(id => id.toString() === problem._id.toString());
            if (!alreadyLogged) {
              daily.problemIds.push(problem._id);
              daily.solvedCount = daily.problemIds.length;
            }
          }
          daily.targetMet = daily.solvedCount >= daily.target;
          await daily.save();
        } else if (oldStatus === 'Done') {
          const solvedDate = up.solvedAt ? getLocalDateString(up.solvedAt) : todayStr;
          up.solvedAt = null;

          const daily = await DailyLog.findOne({ userId, date: solvedDate });
          if (daily) {
            daily.problemIds = daily.problemIds.filter(id => id.toString() !== problem._id.toString());
            daily.solvedCount = daily.problemIds.length;
            daily.targetMet = daily.solvedCount >= daily.target;
            await daily.save();
          }
        }
      }

      if (revisionStatus !== undefined) up.revisionStatus = revisionStatus;
      if (notes !== undefined) up.notes = notes;
      if (isStarred !== undefined) up.isStarred = Boolean(isStarred);

      await up.save();

      return res.json({
        success: true,
        message: 'Problem updated successfully for user',
        data: {
          ...problem.toObject(),
          status: up.status,
          revisionStatus: up.revisionStatus,
          notes: up.notes,
          isStarred: up.isStarred,
          solvedAt: up.solvedAt
        }
      });
    }

    // 2. Guest fallback
    const oldStatus = problem.status;
    if (status !== undefined && status !== oldStatus) {
      problem.status = status;
      if (status === 'Done') {
        problem.solvedAt = new Date();
        let daily = await DailyLog.findOne({ userId: null, date: todayStr });
        if (!daily) {
          daily = new DailyLog({
            userId: null,
            date: todayStr,
            dayOfWeek,
            isWeekend,
            target: 5,
            solvedCount: 1,
            problemIds: [problem._id]
          });
        } else {
          const alreadyLogged = daily.problemIds.some(id => id.toString() === problem._id.toString());
          if (!alreadyLogged) {
            daily.problemIds.push(problem._id);
            daily.solvedCount = daily.problemIds.length;
          }
        }
        daily.targetMet = daily.solvedCount >= daily.target;
        await daily.save();
      } else if (oldStatus === 'Done') {
        const solvedDate = problem.solvedAt ? getLocalDateString(problem.solvedAt) : todayStr;
        problem.solvedAt = null;

        const daily = await DailyLog.findOne({ userId: null, date: solvedDate });
        if (daily) {
          daily.problemIds = daily.problemIds.filter(id => id.toString() !== problem._id.toString());
          daily.solvedCount = daily.problemIds.length;
          daily.targetMet = daily.solvedCount >= daily.target;
          await daily.save();
        }
      }
    }

    if (revisionStatus !== undefined) problem.revisionStatus = revisionStatus;
    if (notes !== undefined) problem.notes = notes;
    if (isStarred !== undefined) problem.isStarred = Boolean(isStarred);

    await problem.save();

    res.json({
      success: true,
      message: 'Problem updated successfully',
      data: problem
    });
  } catch (error) {
    console.error('Error updating problem:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST create custom problem
router.post('/', async (req, res) => {
  try {
    const { title, url, difficulty, topic, subtopic, sheet, notes, isStarred } = req.body;

    if (!title || !url) {
      return res.status(400).json({ success: false, message: 'Title and URL are required' });
    }

    const targetSheet = sheet || 'Custom Problems';
    const lastProblem = await Problem.findOne({ sheet: targetSheet }).sort({ problemNumber: -1 });
    const nextNumber = lastProblem && lastProblem.problemNumber ? lastProblem.problemNumber + 1 : 1;

    const newProblem = new Problem({
      problemNumber: nextNumber,
      sheetIndex: 3,
      sheet: targetSheet,
      title: title.trim(),
      url: url.trim(),
      difficulty: difficulty || 'Medium',
      topic: topic || 'General',
      subtopic: subtopic || '',
      notes: notes || '',
      isStarred: Boolean(isStarred),
      status: 'Todo',
      revisionStatus: 'None'
    });

    await newProblem.save();
    res.status(201).json({ success: true, data: newProblem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST bulk import
router.post('/bulk-import', async (req, res) => {
  try {
    const { problems, sheetName } = req.body;

    if (!Array.isArray(problems) || problems.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or empty problems array' });
    }

    const defaultSheet = sheetName || 'Imported DSA Sheet';
    const docs = problems.map((p, idx) => ({
      problemNumber: p.problemNumber || idx + 1,
      sheetIndex: 3,
      sheet: p.sheet || defaultSheet,
      title: p.title || 'Untitled Problem',
      topic: p.topic || 'General',
      subtopic: p.subtopic || '',
      difficulty: ['Easy', 'Medium', 'Hard'].includes(p.difficulty) ? p.difficulty : 'Medium',
      url: p.url || `https://leetcode.com/problemset/all/?search=${encodeURIComponent(p.title || '')}`,
      isStarred: Boolean(p.isStarred),
      status: p.status || 'Todo',
      revisionStatus: p.revisionStatus || 'None',
      notes: p.notes || ''
    }));

    const inserted = await Problem.insertMany(docs);
    res.status(201).json({ success: true, count: inserted.length, message: `Successfully imported ${inserted.length} problems!` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
