import React, { useState, useMemo } from 'react';
import {
  Layers,
  BarChart3,
  Calendar,
  ChevronRight,
  CheckCircle,
  Activity,
  Sparkles,
  Flame,
  Award,
  Zap,
  ExternalLink,
  Search,
  X,
  Clock,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';

export default function AnalyticsSection({
  topics = [],
  sheets = [],
  recentActivity = [],
  heatmap,
  history = [],
  dailyGoal,
  activeTopic,
  onSelectTopic
}) {
  const [activeTab, setActiveTab] = useState('heatmap'); // 'heatmap' | 'topics' | 'activity' | 'sheets'
  const [selectedDate, setSelectedDate] = useState(null);
  const [hoveredDay, setHoveredDay] = useState(null);
  const [historySearch, setHistorySearch] = useState('');

  // Group heatmap days into columns of weeks (7 days each: Sunday to Saturday)
  const weeks = useMemo(() => {
    if (!heatmap?.days || heatmap.days.length === 0) return [];
    const grouped = [];
    let currentWeek = [];

    heatmap.days.forEach((day, index) => {
      currentWeek.push(day);
      if (day.dayOfWeek === 6 || index === heatmap.days.length - 1) {
        grouped.push(currentWeek);
        currentWeek = [];
      }
    });
    return grouped;
  }, [heatmap?.days]);

  // Determine month labels across week columns
  const monthLabels = useMemo(() => {
    const labels = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let lastMonth = -1;

    weeks.forEach((week, index) => {
      if (week.length > 0) {
        const d = new Date(week[0].date);
        const m = d.getMonth();
        if (m !== lastMonth) {
          labels.push({ colIndex: index, name: monthNames[m] });
          lastMonth = m;
        }
      }
    });
    return labels;
  }, [weeks]);

  // Color intensity for heatmap squares
  const getIntensityClass = (day) => {
    if (!day || day.count === 0) {
      if (day?.isWeekend) {
        return 'bg-slate-900/60 border border-slate-800/80';
      }
      return 'bg-slate-850 border border-slate-800';
    }
    if (day.count >= 5) {
      return 'bg-emerald-400 border border-emerald-200 shadow-[0_0_8px_rgba(52,211,153,0.5)]';
    }
    if (day.count >= 3) {
      return 'bg-emerald-600 border border-emerald-500/80 text-white';
    }
    return 'bg-emerald-900 border border-emerald-600/50';
  };

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

  // Filter history based on selectedDate or search query
  const filteredHistory = useMemo(() => {
    let list = history;
    if (selectedDate) {
      list = list.filter((item) => item.date === selectedDate);
    }
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase().trim();
      list = list
        .map((item) => {
          const matchingProbs = (item.problems || []).filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.topic.toLowerCase().includes(q) ||
              String(p.problemNumber).includes(q)
          );
          if (matchingProbs.length > 0 || item.date.includes(q)) {
            return { ...item, problems: matchingProbs.length > 0 ? matchingProbs : item.problems };
          }
          return null;
        })
        .filter(Boolean);
    }
    return list;
  }, [history, selectedDate, historySearch]);

  const activeDayDetails = hoveredDay || (selectedDate ? heatmap?.days?.find(d => d.date === selectedDate) : null);

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800/80 mb-6 shadow-xl shadow-black/20">
      {/* Section Header & Sub-Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Performance & Roadmap Analytics
            </h2>
            <p className="text-xs text-slate-400">LeetCode submission heatmap, solved history & chapter mastery</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-medium overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'heatmap'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/20 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>LeetCode Heatmap & History</span>
          </button>

          <button
            onClick={() => setActiveTab('topics')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap ${
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
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap ${
              activeTab === 'activity'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>14-Day View</span>
          </button>

          <button
            onClick={() => setActiveTab('sheets')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 whitespace-nowrap ${
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

      {/* Tab 1: LeetCode-style 365-Day Date-wise Heatmap & History */}
      {activeTab === 'heatmap' && (
        <div className="pt-4">
          {/* Heatmap Top Metrics Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Submission & Solved Calendar (Past 365 Days)</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                5 problems/day target on weekdays • Saturday & Sunday off
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                <span className="text-slate-400">Active Days:</span>
                <strong className="text-white font-mono">{heatmap?.totalActiveDays || 0}</strong>
              </div>

              <div className="flex items-center space-x-1.5 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20 text-orange-400">
                <Flame className="w-3.5 h-3.5 fill-orange-400" />
                <span>Streak: <strong>{heatmap?.currentStreak || 0}d</strong></span>
              </div>

              <div className="flex items-center space-x-1.5 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 text-indigo-300">
                <Award className="w-3.5 h-3.5" />
                <span>Max: <strong>{heatmap?.maxStreak || 0}d</strong></span>
              </div>
            </div>
          </div>

          {/* Interactive Heatmap Grid Container */}
          <div className="overflow-x-auto pb-2">
            <div className="min-w-[760px]">
              {/* Month Markers Row */}
              <div className="flex mb-1 text-[10px] text-slate-400 font-medium pl-6">
                {weeks.map((week, idx) => {
                  const label = monthLabels.find((m) => m.colIndex === idx);
                  return (
                    <div key={idx} className="w-3.5 mr-1 text-center shrink-0">
                      {label ? label.name : ''}
                    </div>
                  );
                })}
              </div>

              {/* Main Calendar Heatmap Grid (7 rows: Sun - Sat) */}
              <div className="flex">
                {/* Day of Week Labels (Mon, Wed, Fri) */}
                <div className="flex flex-col justify-between text-[9px] text-slate-500 font-semibold pr-1.5 w-6 select-none shrink-0 h-[105px]">
                  <span></span>
                  <span>Mon</span>
                  <span></span>
                  <span>Wed</span>
                  <span></span>
                  <span>Fri</span>
                  <span></span>
                </div>

                {/* Week Columns */}
                <div className="flex gap-1">
                  {weeks.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1 shrink-0">
                      {/* 7 Day slots per week: 0=Sun, 1=Mon, ..., 6=Sat */}
                      {[0, 1, 2, 3, 4, 5, 6].map((daySlot) => {
                        const day = week.find((d) => d.dayOfWeek === daySlot);
                        if (!day) {
                          return (
                            <div
                              key={daySlot}
                              className="w-3.5 h-3.5 rounded-[3px] bg-transparent"
                            />
                          );
                        }

                        const isSelected = selectedDate === day.date;
                        const isToday = day.date === new Date().toISOString().slice(0, 10);

                        return (
                          <div
                            key={day.date}
                            onClick={() => {
                              setSelectedDate((prev) => (prev === day.date ? null : day.date));
                            }}
                            onMouseEnter={() => setHoveredDay(day)}
                            onMouseLeave={() => setHoveredDay(null)}
                            title={`${day.date}: ${day.count} solved ${
                              day.targetMet ? '(Target Met 🎯)' : day.isWeekend ? '(Weekend Off)' : ''
                            }`}
                            className={`w-3.5 h-3.5 rounded-[3px] cursor-pointer transition-all duration-150 ${getIntensityClass(
                              day
                            )} ${
                              isSelected
                                ? 'ring-2 ring-indigo-400 scale-125 z-10'
                                : isToday
                                ? 'ring-1 ring-white/80'
                                : 'hover:scale-125 hover:z-10'
                            }`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Heatmap Legend & Interactive Day Inspector */}
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-400 text-[11px] flex items-center gap-1.5">
              <span>Tip: Click any square on the heatmap to view solved history for that date.</span>
            </div>

            {/* Legend scale */}
            <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
              <span>Less</span>
              <div className="w-3 h-3 rounded-[2px] bg-slate-850 border border-slate-800" title="0 Solved" />
              <div className="w-3 h-3 rounded-[2px] bg-emerald-900 border border-emerald-600/50" title="1-2 Solved" />
              <div className="w-3 h-3 rounded-[2px] bg-emerald-600 border border-emerald-500" title="3-4 Solved" />
              <div className="w-3 h-3 rounded-[2px] bg-emerald-400 border border-emerald-200" title="5+ Solved (Target Hit!)" />
              <span>More</span>
            </div>
          </div>

          {/* Active Day Inspection Banner (Hover or Click) */}
          {activeDayDetails && (
            <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs animate-in fade-in">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-white">{activeDayDetails.date}</span>
                <span className="text-slate-400">
                  • <strong className="text-emerald-400">{activeDayDetails.count}</strong> problems solved
                </span>
                {activeDayDetails.targetMet && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    🎯 5/5 Target Met
                  </span>
                )}
                {activeDayDetails.isWeekend && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    🌴 Weekend Off
                  </span>
                )}
              </div>

              {selectedDate && (
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Show All Dates</span>
                </button>
              )}
            </div>
          )}

          {/* Solved Problems History Log Section */}
          <div className="mt-6 pt-4 border-t border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <span>📜 Solved Problems History</span>
                  {selectedDate && (
                    <span className="text-xs font-normal text-indigo-400">
                      (Filtered: {selectedDate})
                    </span>
                  )}
                </h3>
              </div>

              {/* History Search bar */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter history by problem..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
                {historySearch && (
                  <button
                    onClick={() => setHistorySearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* History Feed */}
            {filteredHistory.length === 0 ? (
              <div className="py-8 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800/60">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-xs font-semibold text-slate-400">
                  {selectedDate
                    ? `No solved problems logged on ${selectedDate}`
                    : 'No solved problems recorded yet'}
                </p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Mark problems as "Done" to build your heatmap and history timeline.
                </p>
                {selectedDate && (
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="mt-3 px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                  >
                    View All History
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {filteredHistory.map((item) => (
                  <div
                    key={item.date}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition"
                  >
                    {/* Date Header */}
                    <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800/60">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-white font-mono">{item.date}</span>
                        <span className="text-xs text-slate-400">({item.dayName || 'Day'})</span>
                        {item.targetMet && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            🎯 5/5 Target Hit
                          </span>
                        )}
                        {item.isWeekend && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            🌴 Weekend
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-emerald-400">
                        {item.solvedCount} Solved
                      </span>
                    </div>

                    {/* Problems solved on this day */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {(item.problems || []).map((prob) => (
                        <div
                          key={prob._id}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-850/60 border border-slate-800 text-xs hover:border-slate-700 transition"
                        >
                          <div className="flex items-center space-x-2 min-w-0 pr-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="font-mono text-slate-400 text-[11px] shrink-0">
                              #{prob.problemNumber}
                            </span>
                            <span className="font-medium text-slate-200 truncate">{prob.title}</span>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${getDifficultyBadge(
                                prob.difficulty
                              )}`}
                            >
                              {prob.difficulty}
                            </span>
                            <a
                              href={prob.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open on LeetCode"
                              className="text-slate-400 hover:text-indigo-400 p-0.5 transition"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Topic Matrix */}
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

      {/* Tab 3: 14-Day Activity Heat Bar */}
      {activeTab === 'activity' && (
        <div className="pt-4">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
            <span>Daily 5-Problem Target Log (Saturday & Sunday Off):</span>
            <span className="text-emerald-400 font-medium">🎯 Goal: 5 Solved / Weekday</span>
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-14 gap-1 sm:gap-2">
            {recentActivity.map((day) => {
              const isToday = day.date === new Date().toISOString().slice(0, 10);
              return (
                <div
                  key={day.date}
                  className={`p-1.5 sm:p-3 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
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
                  <span className="text-[9px] sm:text-[10px] font-semibold text-slate-400 uppercase">
                    {day.day}
                  </span>
                  <span className="text-[8px] sm:text-[10px] text-slate-500 my-0.5">
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

      {/* Tab 4: Sheet Breakdown */}
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
