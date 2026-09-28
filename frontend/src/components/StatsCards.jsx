import React from 'react';
import { Target, CheckCircle2, Bookmark, Star, AlertCircle, ArrowUpRight, Flame, ShieldCheck } from 'lucide-react';

export default function StatsCards({
  summary,
  dailyGoal,
  difficulties,
  onQuickFilter
}) {
  const total = summary?.total || 500;
  const solved = summary?.solved || 0;
  const percentage = summary?.percentage || 0;
  const starred = summary?.starred || 0;
  const needRevise = summary?.needRevise || 0;
  const oneTimeRevise = summary?.oneTimeRevise || 0;
  const mastered = summary?.mastered || 0;

  const todaySolved = dailyGoal?.todaySolved || 0;
  const dailyTarget = dailyGoal?.dailyTarget || 5;
  const isWeekend = dailyGoal?.isWeekend;
  const streak = dailyGoal?.streak || 0;

  // Breakdown counts
  const easyStats = difficulties?.find(d => d.difficulty === 'Easy') || { solved: 0, total: 0 };
  const medStats = difficulties?.find(d => d.difficulty === 'Medium') || { solved: 0, total: 0 };
  const hardStats = difficulties?.find(d => d.difficulty === 'Hard') || { solved: 0, total: 0 };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* 1. Total Progress */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700/80 transition-all shadow-lg shadow-black/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Solved</span>
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2 mb-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{solved}</span>
          <span className="text-slate-400 text-sm font-medium">/ {total}</span>
          <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {percentage}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-500 rounded-full"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        {/* Sub counts */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            E: <strong className="text-slate-200">{easyStats.solved}/{easyStats.total}</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            M: <strong className="text-slate-200">{medStats.solved}/{medStats.total}</strong>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            H: <strong className="text-slate-200">{hardStats.solved}/{hardStats.total}</strong>
          </span>
        </div>
      </div>

      {/* 2. Daily 5 Target & Weekend Off Engine */}
      <div className={`glass-panel rounded-2xl p-4 sm:p-5 border relative overflow-hidden group transition-all shadow-lg shadow-black/20 ${
        isWeekend
          ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/5 via-slate-900 to-slate-900'
          : todaySolved >= dailyTarget
          ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 via-slate-900 to-slate-900 glow-emerald'
          : 'border-slate-800/80 hover:border-slate-700/80'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Daily Target</span>
            {isWeekend ? (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                WEEKEND OFF
              </span>
            ) : (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                MON-FRI
              </span>
            )}
          </div>
          <div className={`p-2 rounded-xl border ${
            isWeekend
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              : todaySolved >= dailyTarget
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
          }`}>
            <Target className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2 mb-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{todaySolved}</span>
          <span className="text-slate-400 text-sm font-medium">/ {dailyTarget} Today</span>
          {todaySolved >= dailyTarget && (
            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              TARGET HIT 🎯
            </span>
          )}
        </div>

        {/* 5-Segment Target Bar */}
        <div className="grid grid-cols-5 gap-1.5 mb-3">
          {[1, 2, 3, 4, 5].map((step) => {
            const isFilled = todaySolved >= step;
            return (
              <div
                key={step}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isFilled
                    ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50'
                    : 'bg-slate-800 border border-slate-700/50'
                }`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
          <div className="flex items-center space-x-1 text-orange-400 font-medium">
            <Flame className="w-3.5 h-3.5 fill-orange-400" />
            <span>{streak} Day Streak</span>
          </div>
          <span className="text-slate-400 text-[10px]">
            {isWeekend ? 'Sat & Sun Off (No penalty)' : `${Math.max(0, dailyTarget - todaySolved)} left for goal`}
          </span>
        </div>
      </div>

      {/* 3. Revision Queue */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700/80 transition-all shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Revision Radar</span>
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2 mb-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{needRevise}</span>
          <span className="text-slate-400 text-sm font-medium">Need Revise</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => onQuickFilter({ revisionStatus: 'Need Revise' })}
            className="flex-1 py-1 px-2 rounded-lg text-xs font-medium bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition flex items-center justify-center space-x-1"
          >
            <span>Priority: {needRevise}</span>
          </button>
          <button
            onClick={() => onQuickFilter({ revisionStatus: 'One Time Revision' })}
            className="flex-1 py-1 px-2 rounded-lg text-xs font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition flex items-center justify-center space-x-1"
          >
            <span>1x Revise: {oneTimeRevise}</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
          <span className="text-emerald-400 font-medium">Mastered: {mastered}</span>
          <button
            onClick={() => onQuickFilter({ revisionStatus: 'all-flagged' })}
            className="text-slate-300 hover:text-white flex items-center gap-0.5 text-[10px]"
          >
            Filter Flagged <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 4. Curated FAANG Essentials */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800/80 relative overflow-hidden group hover:border-slate-700/80 transition-all shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">FAANG Starred (⭐)</span>
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
        </div>

        <div className="flex items-baseline space-x-2 mb-2">
          <span className="text-3xl font-extrabold text-white tracking-tight">{starred}</span>
          <span className="text-slate-400 text-sm font-medium">High Frequency</span>
        </div>

        <p className="text-xs text-slate-400 mb-3 line-clamp-1">
          Hand-picked core patterns frequently repeated in Google, Meta, Amazon interviews.
        </p>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
          <button
            onClick={() => onQuickFilter({ isStarred: true })}
            className="w-full py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 transition flex items-center justify-center space-x-1.5 font-medium"
          >
            <Star className="w-3 h-3 fill-amber-400" />
            <span>Show All {starred} Starred Problems</span>
          </button>
        </div>
      </div>
    </div>
  );
}
