import React, { useState } from 'react';
import { Layers, BarChart3, Calendar, ChevronRight, CheckCircle, Activity, Sparkles, Filter } from 'lucide-react';

export default function AnalyticsSection({
  topics = [],
  sheets = [],
  recentActivity = [],
  activeTopic,
  onSelectTopic
}) {
  const [activeTab, setActiveTab] = useState('topics'); // 'topics' | 'activity' | 'sheets'

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 mb-6 shadow-xl shadow-black/20">
      {/* Section Header & Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Performance & Roadmap Analytics
            </h2>
            <p className="text-xs text-slate-400">Chapter mastery, sheet progression & activity tracking</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('topics')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'topics'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Topic Matrix ({topics.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'activity'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>14-Day Activity</span>
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
              activeTab === 'sheets'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sheet Breakdown</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Topic Matrix */}
      {activeTab === 'topics' && (
        <div className="pt-4">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span>Click any chapter card to filter the problem table below:</span>
            {activeTopic && activeTopic !== 'all' && (
              <button
                onClick={() => onSelectTopic('all')}
                className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                Clear filter ({activeTopic})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto pr-1">
            {topics.map((t) => {
              const isSelected = activeTopic === t.topic;
              return (
                <div
                  key={t.topic}
                  onClick={() => onSelectTopic(isSelected ? 'all' : t.topic)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-indigo-900/30 border-indigo-500 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-900/50 hover:bg-slate-800/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-200 group-hover:text-white line-clamp-1 pr-2">
                      {t.topic}
                    </span>
                    <span className="text-[11px] font-bold text-indigo-400 shrink-0">
                      {t.percentage}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        t.percentage === 100
                          ? 'bg-emerald-400'
                          : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                      }`}
                      style={{ width: `${t.percentage}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      <strong className="text-slate-200">{t.solved}</strong> / {t.total} Solved
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      {t.easy > 0 && <span className="text-emerald-400">{t.easy}E</span>}
                      {t.medium > 0 && <span className="text-amber-400">{t.medium}M</span>}
                      {t.hard > 0 && <span className="text-rose-400">{t.hard}H</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: 14-Day Activity Heat Bar */}
      {activeTab === 'activity' && (
        <div className="pt-4">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span>Daily 5-Problem Target Log (Saturday & Sunday Off):</span>
            <span className="text-emerald-400 font-medium">🎯 Goal: 5 Solved / Weekday</span>
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-14 gap-2">
            {recentActivity.map((day) => {
              const isToday = day.date === new Date().toISOString().slice(0, 10);
              return (
                <div
                  key={day.date}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                    isToday
                      ? 'border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500/50'
                      : day.isWeekend
                      ? 'bg-slate-900/30 border-dashed border-slate-800 text-slate-500'
                      : day.solvedCount >= 5
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : day.solvedCount > 0
                      ? 'bg-indigo-950/20 border-indigo-500/30'
                      : 'bg-slate-900/50 border-slate-800/80'
                  }`}
                >
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">
                    {day.day}
                  </span>
                  <span className="text-[10px] text-slate-500 my-0.5">
                    {day.date.slice(5)}
                  </span>

                  <div className="my-1.5">
                    {day.isWeekend ? (
                      <span className="text-xs font-bold text-amber-300/80">OFF</span>
                    ) : day.solvedCount >= 5 ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/40">
                        ✓
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-300">
                        {day.solvedCount}
                      </span>
                    )}
                  </div>

                  <span className="text-[9px] text-slate-500 font-medium">
                    {day.isWeekend ? (day.solvedCount > 0 ? `+${day.solvedCount} bonus` : 'Rest') : `${day.solvedCount}/5`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Sheet Breakdown */}
      {activeTab === 'sheets' && (
        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {sheets.map((s) => (
            <div
              key={s.sheet}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-white">{s.sheet}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {s.percentage}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">
                {s.sheet.includes('300')
                  ? 'Core FAANG foundational interview preparation covering 14 key chapters from 1D Arrays to Graphs.'
                  : 'Advanced 200 interview set focusing heavily on Trees, Graphs, Shortest Path, and Dynamic Programming.'}
              </p>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${s.percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-medium">
                <span>Completed: <strong className="text-slate-200">{s.solved}</strong></span>
                <span>Total: <strong className="text-slate-200">{s.total}</strong> problems</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
