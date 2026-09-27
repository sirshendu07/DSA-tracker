const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(path.join(__dirname, 'raw_sheet_data.txt'), 'utf8');
const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

const problems = [];
let currentSheet = 'Top 300 FAANG Roadmap';
let currentTopic = 'Arrays — 1D + Hashing';
let currentSubtopic = '';
let inPart2 = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  if (line.includes('--- PART 2 ---')) {
    inPart2 = true;
    currentSheet = 'Advanced 200 (Trees, Graphs, DP)';
    continue;
  }

  // Detect Chapter/Section in Part 1
  if (!inPart2) {
    const chapMatch = line.match(/^(\d+)\.\s*(.+?)(?:\s*—\s*\d+\s*problems)?$/i);
    if (chapMatch) {
      currentTopic = chapMatch[2].replace(/\s*—\s*\d+\s*problems.*$/i, '').trim();
      currentSubtopic = currentTopic;
      continue;
    }
  } else {
    // Detect Part 2 sections
    if (line.includes('PART 1 — TREES')) {
      currentTopic = 'Trees / BST / Tree DP';
      currentSubtopic = 'Trees';
      continue;
    } else if (line.includes('PART 2 — GRAPH')) {
      currentTopic = 'Graph';
      currentSubtopic = 'Graph BFS / DFS';
      continue;
    } else if (line.includes('PART 3 — DYNAMIC PROGRAMMING')) {
      currentTopic = 'Dynamic Programming';
      currentSubtopic = '1D DP';
      continue;
    } else if (line.includes('PART 4 — MIXED')) {
      currentTopic = 'Mixed / Advanced Patterns';
      currentSubtopic = 'Mixed';
      continue;
    }

    // Subtopics in Part 2
    if (line === 'Basic → Intermediate Trees' ||
        line === 'Advanced Binary Tree' ||
        line === '🌲 BST' ||
        line === 'Graph BFS / DFS' ||
        line === 'Topological Sort / DAG' ||
        line === 'Union Find / DSU' ||
        line === 'Shortest Path' ||
        line === 'MST / Advanced Graph' ||
        line === '1D DP' ||
        line === '2D DP / Grid DP' ||
        line === 'String DP' ||
        line === 'Knapsack / Subset DP' ||
        line === 'Advanced DP') {
      currentSubtopic = line.replace(/^[🌲🕸️🧠🔀\s]+/, '').trim();
      continue;
    }
  }

  // Check if line is a number denoting problem index
  if (/^\d+$/.test(line)) {
    const num = parseInt(line, 10);
    // Next line should be title
    const nextLine1 = lines[i + 1];
    const nextLine2 = lines[i + 2];
    const nextLine3 = lines[i + 3];

    if (nextLine1 && nextLine2 && nextLine3) {
      // Check if nextLine3 or nextLine2 has leetcode link
      let titleLine = nextLine1;
      let diffLine = nextLine2;
      let linkLine = nextLine3;

      let isStarred = titleLine.includes('⭐');
      let cleanTitle = titleLine.replace(/⭐/g, '').trim();

      let difficulty = 'Medium';
      if (diffLine.includes('🟢') || diffLine.toLowerCase().includes('easy')) {
        difficulty = 'Easy';
      } else if (diffLine.includes('🔴') || diffLine.toLowerCase().includes('hard')) {
        difficulty = 'Hard';
      } else if (diffLine.includes('🟡') || diffLine.toLowerCase().includes('medium')) {
        difficulty = 'Medium';
      }

      // In Part 4, diffLine might be "Main Patterns" e.g. "BFS + Hashing", but link is in nextLine3 or nextLine2
      let url = '';
      const urlMatch = (linkLine + ' ' + diffLine).match(/https?:\/\/[^\s\)]+/);
      if (urlMatch) {
        url = urlMatch[0];
      }

      // Clean leetcode tracking params if any
      url = url.replace(/\?utm_source=chatgpt\.com.*/, '');

      problems.push({
        problemNumber: inPart2 ? num + 300 : num,
        sheetIndex: inPart2 ? 2 : 1,
        sheet: currentSheet,
        topic: currentTopic,
        subtopic: currentSubtopic || currentTopic,
        title: cleanTitle,
        isStarred,
        difficulty,
        url: url || `https://leetcode.com/problemset/all/?search=${encodeURIComponent(cleanTitle)}`,
        status: 'Todo',
        revisionStatus: 'None',
        notes: '',
        solvedAt: null
      });

      i += 3; // Skip the 3 consumed lines
    }
  }
}

console.log(`Parsed total ${problems.length} problems`);
const p1Count = problems.filter(p => p.sheet === 'Top 300 FAANG Roadmap').length;
const p2Count = problems.filter(p => p.sheet === 'Advanced 200 (Trees, Graphs, DP)').length;
console.log(`Sheet 1 (Top 300): ${p1Count}`);
console.log(`Sheet 2 (Advanced 200): ${p2Count}`);

fs.writeFileSync(path.join(__dirname, 'problems_seed.json'), JSON.stringify(problems, null, 2), 'utf8');
