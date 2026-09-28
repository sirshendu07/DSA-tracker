import React, { useState } from 'react';
import {
  ExternalLink,
  Star,
  CheckCircle2,
  Circle,
  FileText,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Tag,
  AlertCircle,
  Clock,
  Check,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ProblemTable({
  problems = [],
  loading,
  selectedSheet,
  onChangeSheet,
  selectedTopic,
  onChangeTopic,
  selectedDifficulty,
  onChangeDifficulty,
  selectedStatus,
  onChangeStatus,
  selectedRevision,
  onChangeRevision,
  searchQuery,
  onChangeSearch,
  starredOnly,
  onToggleStarredOnly,
  faangCoreOnly,
  onToggleFaangCoreOnly,
  onResetAllFilters,
  onUpdateProblem,
  onOpenNotes,
  dailyGoal
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Handle Mark Done with celebratory confetti
  const handleToggleStatus = (problem) => {
    const nextStatus = problem.status === 'Done' ? 'Todo' : 'Done';
    onUpdateProblem(problem._id, { status: nextStatus });

    if (nextStatus === 'Done') {
      // If completing this achieves or exceeds daily target, fire big confetti!
      const currentToday = dailyGoal?.todaySolved || 0;
      if (currentToday + 1 >= 5) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handleToggleStar = (problem) => {
    onUpdateProblem(problem._id, { isStarred: !problem.isStarred });
  };

  const handleChangeRevision = (problem, revisionStatus) => {
    onUpdateProblem(problem._id, { revisionStatus });
  };

  // Pagination calculation
  const totalItems = problems.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const visibleProblems = problems.slice(startIndex, startIndex + itemsPerPage);

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'Easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    }
  };

  const getRevisionBadge = (status) => {
    switch (status) {
      case 'Need Revise':
        return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'One Time Revision':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'Mastered':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="glass-panel rounded-2xl border border-slate-800/80 shadow-2xl shadow-black/30 overflow-hidden">
      {/* 1. Sheet Tabs Header */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => { onChangeSheet('all'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 ${
                selectedSheet === 'all'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>🌐 All Curated (500)</span>
            </button>

            <button
              onClick={() => { onChangeSheet('Top 300 FAANG Roadmap'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 ${
                selectedSheet === 'Top 300 FAANG Roadmap'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>🔥 Top 300 Roadmap</span>
            </button>

            <button
              onClick={() => { onChangeSheet('Advanced 200 (Trees, Graphs, DP)'); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-2 ${
                selectedSheet === 'Advanced 200 (Trees, Graphs, DP)'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>⚡ Advanced 200 (Trees, Graphs, DP)</span>
            </button>
          </div>

          {/* Quick Problem count indicator */}
          <div className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-white">{problems.length}</strong> matching problems
          </div>
        </div>

        {/* 2. Search & Filter Bar */}
        <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search problem title, #, topic or notes..."
              value={searchQuery}
              onChange={(e) => { onChangeSearch(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => { onChangeSearch(''); setCurrentPage(1); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => { onChangeStatus(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Status (Todo & Done)</option>
            <option value="Todo">⏳ Todo Only</option>
            <option value="Done">✅ Solved Only</option>
            <option value="In Progress">🔄 In Progress</option>
          </select>

          {/* Revision Status Filter */}
          <select
            value={selectedRevision}
            onChange={(e) => { onChangeRevision(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Revisions</option>
            <option value="Need Revise">🔴 Need Revise</option>
            <option value="One Time Revision">🟡 One Time Revision</option>
            <option value="Mastered">🟢 Mastered</option>
            <option value="None">No Revision Tag</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => { onChangeDifficulty(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Difficulties</option>
            <option value="Easy">🟢 Easy</option>
            <option value="Medium">🟡 Medium</option>
            <option value="Hard">🔴 Hard</option>
          </select>
        </div>

        {/* Filter Pills row (Starred toggle, FAANG Core toggle, Clear) */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { onToggleStarredOnly(); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition flex items-center space-x-1.5 ${
                starredOnly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10'
                  : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${starredOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>⭐ My Starred</span>
            </button>

            <button
              onClick={() => { onToggleFaangCoreOnly(); setCurrentPage(1); }}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition flex items-center space-x-1.5 ${
                faangCoreOnly
                  ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/50 shadow-sm shadow-indigo-500/20 font-semibold'
                  : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <span>🔥 FAANG Core (132)</span>
            </button>

            {selectedTopic && selectedTopic !== 'all' && (
              <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs flex items-center gap-1.5">
                <span>Topic: {selectedTopic}</span>
                <button onClick={() => onChangeTopic('all')} className="hover:text-white">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {(selectedSheet !== 'all' || selectedTopic !== 'all' || selectedDifficulty !== 'all' || selectedStatus !== 'all' || selectedRevision !== 'all' || searchQuery || starredOnly || faangCoreOnly) && (
            <button
              onClick={() => {
                if (onResetAllFilters) {
                  onResetAllFilters();
                } else {
                  onChangeSheet('all');
                  onChangeTopic('all');
                  onChangeDifficulty('all');
                  onChangeStatus('all');
                  onChangeRevision('all');
                  onChangeSearch('');
                  if (starredOnly) onToggleStarredOnly();
                }
                setCurrentPage(1);
              }}
              className="text-xs text-rose-400 hover:text-rose-300 underline"
            >
              Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* 3. Problems List - Responsive Mobile Cards (< md) & Desktop Table (>= md) */}

      {/* 3A. Mobile Card View (Phone / Small Screens) */}
      <div className="block md:hidden divide-y divide-slate-800/80">
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <span>Loading curated FAANG problems...</span>
            </div>
          </div>
        ) : visibleProblems.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-400">
            <div className="max-w-xs mx-auto space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="font-semibold text-slate-300">No problems match your filters</p>
              <p className="text-xs text-slate-500">Try adjusting your search terms, topic, or difficulty filters.</p>
            </div>
          </div>
        ) : (
          visibleProblems.map((problem) => {
            const isDone = problem.status === 'Done';
            return (
              <div
                key={problem._id}
                className={`p-3.5 transition-colors ${
                  isDone ? 'bg-emerald-950/15' : 'hover:bg-slate-900/60'
                }`}
              >
                {/* Header: Done Checkbox + Star + Problem # + Difficulty */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2.5">
                    <button
                      onClick={() => handleToggleStatus(problem)}
                      title={isDone ? 'Mark as Todo' : 'Mark as Solved'}
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-400 text-black shadow-sm shadow-emerald-500/40'
                          : 'border-slate-700 bg-slate-900/60 text-transparent active:border-indigo-400'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStar(problem);
                      }}
                      title={problem.isStarred ? 'Unstar problem' : 'Star FAANG high-frequency question'}
                      className="p-1 rounded-lg text-slate-500 active:scale-125 transition"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          problem.isStarred
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                            : 'text-slate-600'
                        }`}
                      />
                    </button>

                    <span className="font-mono text-xs font-semibold text-slate-400">
                      #{problem.problemNumber}
                    </span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getDifficultyBadge(
                      problem.difficulty
                    )}`}
                  >
                    {problem.difficulty}
                  </span>
                </div>

                {/* Problem Name & Direct LeetCode Link */}
                <div className="mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <a
                      href={problem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open on LeetCode"
                      className={`text-sm font-semibold hover:underline hover:text-indigo-400 transition flex items-baseline gap-1.5 ${
                        isDone ? 'text-slate-300 line-through opacity-80' : 'text-white'
                      }`}
                    >
                      <span>{problem.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-indigo-400 opacity-70 shrink-0 inline-block self-center" />
                    </a>
                    {problem.isFaangCore && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                        ⭐ FAANG Core
                      </span>
                    )}
                  </div>
                  {problem.notes && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 italic">
                      <span className="text-indigo-400 font-medium">Note:</span> {problem.notes}
                    </p>
                  )}
                </div>

                {/* Chapter & Topic Badges */}
                <div className="flex flex-wrap items-center gap-1.5 mb-2.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 font-medium">
                    {problem.topic}
                  </span>
                  {problem.subtopic && problem.subtopic !== problem.topic && (
                    <span className="px-1.5 py-0.5 rounded-md bg-slate-800/60 text-slate-400 text-[10px]">
                      {problem.subtopic}
                    </span>
                  )}
                </div>

                {/* Footer Controls: Revision Status + Notes Modal + Direct Link */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 gap-2">
                  <div className="flex-1">
                    <select
                      value={problem.revisionStatus || 'None'}
                      onChange={(e) => handleChangeRevision(problem, e.target.value)}
                      className={`w-full text-xs px-2 py-1.5 rounded-lg border font-medium cursor-pointer focus:outline-none transition ${getRevisionBadge(
                        problem.revisionStatus
                      )}`}
                    >
                      <option value="None" className="bg-slate-900 text-slate-300">
                        No Revision Tag
                      </option>
                      <option value="Need Revise" className="bg-slate-900 text-rose-300">
                        🔴 Need Revise
                      </option>
                      <option value="One Time Revision" className="bg-slate-900 text-amber-300">
                        🟡 1-Time Revise
                      </option>
                      <option value="Mastered" className="bg-slate-900 text-emerald-300">
                        🟢 Mastered
                      </option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => onOpenNotes(problem)}
                      title="Add personal solution notes"
                      className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center space-x-1 transition ${
                        problem.notes
                          ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 active:bg-slate-700'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Notes</span>
                    </button>

                    <a
                      href={problem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Direct link to LeetCode"
                      className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-300 active:text-indigo-400 transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3B. Desktop Table View (>= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse min-w-[720px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold">
              <th className="py-3 px-4 w-12 text-center">Done</th>
              <th className="py-3 px-3 w-10 text-center">⭐</th>
              <th className="py-3 px-4 w-16">#</th>
              <th className="py-3 px-4">Problem Name & Link</th>
              <th className="py-3 px-4 w-28">Difficulty</th>
              <th className="py-3 px-4">Chapter / Topic</th>
              <th className="py-3 px-4 w-44">Revision Status</th>
              <th className="py-3 px-4 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading curated FAANG problems...</span>
                  </div>
                </td>
              </tr>
            ) : visibleProblems.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-slate-400">
                  <div className="max-w-xs mx-auto space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
                    <p className="font-semibold text-slate-300">No problems match your filters</p>
                    <p className="text-xs text-slate-500">Try adjusting your search terms, topic, or difficulty filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              visibleProblems.map((problem) => {
                const isDone = problem.status === 'Done';
                return (
                  <tr
                    key={problem._id}
                    className={`transition-colors hover:bg-slate-850/40 ${
                      isDone ? 'bg-emerald-950/10' : ''
                    }`}
                  >
                    {/* Checkbox Done */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(problem)}
                        title={isDone ? 'Mark as Todo' : 'Mark as Solved'}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-emerald-500 border-emerald-400 text-black shadow-sm shadow-emerald-500/40'
                            : 'border-slate-700 hover:border-indigo-400 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </td>

                    {/* Star Button */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStar(problem);
                        }}
                        title={problem.isStarred ? 'Unstar problem' : 'Star FAANG high-frequency question'}
                        className="p-1.5 rounded-lg hover:bg-slate-800 transition-all text-slate-500 hover:text-amber-400 group/star"
                      >
                        <Star
                          className={`w-4 h-4 transition-all duration-200 active:scale-125 ${
                            problem.isStarred
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                              : 'text-slate-600 group-hover/star:text-amber-300'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Problem Number */}
                    <td className="py-3 px-4 font-mono text-slate-400">
                      #{problem.problemNumber}
                    </td>

                    {/* Problem Name & Direct LeetCode Link */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <a
                          href={problem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open on LeetCode"
                          className={`font-semibold text-sm hover:underline hover:text-indigo-400 transition flex items-center gap-1.5 ${
                            isDone ? 'text-slate-300 line-through opacity-80' : 'text-white'
                          }`}
                        >
                          <span>{problem.title}</span>
                          <ExternalLink className="w-3 h-3 text-indigo-400 opacity-60 hover:opacity-100 shrink-0" />
                        </a>
                        {problem.isFaangCore && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                            ⭐ FAANG Core
                          </span>
                        )}
                      </div>
                      {problem.notes && (
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 italic flex items-center gap-1">
                          <span className="text-indigo-400">Note:</span> {problem.notes}
                        </p>
                      )}
                    </td>

                    {/* Difficulty Badge */}
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getDifficultyBadge(
                          problem.difficulty
                        )}`}
                      >
                        {problem.difficulty}
                      </span>
                    </td>

                    {/* Topic / Chapter */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-200">{problem.topic}</span>
                        {problem.subtopic && problem.subtopic !== problem.topic && (
                          <span className="text-[10px] text-slate-400">{problem.subtopic}</span>
                        )}
                      </div>
                    </td>

                    {/* Revision Status Dropdown */}
                    <td className="py-3 px-4">
                      <select
                        value={problem.revisionStatus || 'None'}
                        onChange={(e) => handleChangeRevision(problem, e.target.value)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium cursor-pointer focus:outline-none transition ${getRevisionBadge(
                          problem.revisionStatus
                        )}`}
                      >
                        <option value="None" className="bg-slate-900 text-slate-300">
                          No Tag
                        </option>
                        <option value="Need Revise" className="bg-slate-900 text-rose-300">
                          🔴 Need Revise
                        </option>
                        <option value="One Time Revision" className="bg-slate-900 text-amber-300">
                          🟡 1-Time Revise
                        </option>
                        <option value="Mastered" className="bg-slate-900 text-emerald-300">
                          🟢 Mastered
                        </option>
                      </select>
                    </td>

                    {/* Action buttons (Notes & Direct link) */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onOpenNotes(problem)}
                          title="Add personal solution notes"
                          className={`p-1.5 rounded-lg border transition ${
                            problem.notes
                              ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        <a
                          href={problem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Direct link to LeetCode"
                          className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-indigo-400 hover:border-slate-700 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Pagination Footer */}
      <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div>
          Showing <span className="text-white font-medium">{startIndex + 1}</span> to{' '}
          <span className="text-white font-medium">
            {Math.min(startIndex + itemsPerPage, totalItems)}
          </span>{' '}
          of <span className="text-white font-medium">{totalItems}</span> problems
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 font-semibold text-white">
            Page {safePage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
