import React from 'react';
import {
  Flame,
  Code2,
  PlusCircle,
  UploadCloud,
  RefreshCw,
  Calendar,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';

export default function Navbar({
  dailyGoal,
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenAdd,
  onOpenImport,
  onRefresh,
  loading
}) {
  const isWeekend = dailyGoal?.isWeekend;
  const todaySolved = dailyGoal?.todaySolved || 0;
  const dailyTarget = dailyGoal?.dailyTarget || 5;
  const streak = dailyGoal?.streak || 0;
  const targetMet = dailyGoal?.targetMet;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#090d16]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#0d1322] rounded-[11px] flex items-center justify-center">
              <Code2 className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                LeetPulse
              </span>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                FAANG 500
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Curated Interview Roadmap & Analytics</p>
          </div>
        </div>

        {/* Center: Live Daily Goal Pill & Weekend Status */}
        <div className="hidden lg:flex items-center space-x-3">
          <div
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
              isWeekend
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                : targetMet
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 shadow-sm shadow-emerald-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-300'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {isWeekend ? (
                <>🌴 <strong className="text-amber-200">Weekend Off:</strong> Rest & Free Practice</>
              ) : (
                <>🎯 Daily Target: <strong className="text-white">{todaySolved} / {dailyTarget}</strong> {targetMet ? '🎉 Done!' : 'Solved'}</>
              )}
            </span>
          </div>

          {/* Streak Badge */}
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 animate-pulse" />
            <span>{streak} Day Streak</span>
            <span className="text-[10px] text-orange-300/70 font-normal">(Sat/Sun Off)</span>
          </div>
        </div>

        {/* Right Action Buttons & User Profile */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onRefresh}
            title="Refresh Data"
            disabled={loading}
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          <button
            onClick={onOpenImport}
            className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <UploadCloud className="w-3.5 h-3.5 text-indigo-400" />
            <span>Import</span>
          </button>

          <button
            onClick={onOpenAdd}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/80 hover:bg-indigo-600 text-white border border-indigo-500/30 transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>

          {/* User Profile / Auth Button */}
          {currentUser ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
              <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-2.5 py-1.5 rounded-xl">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white text-[11px] font-bold flex items-center justify-center uppercase shadow-sm">
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </div>
                <span className="text-xs font-semibold text-slate-200 max-w-[90px] truncate hidden sm:inline">
                  {currentUser.name}
                </span>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="text-slate-400 hover:text-rose-400 p-0.5 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-md shadow-indigo-500/20 transition whitespace-nowrap"
            >
              <LogIn className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Sign In / Sign Up</span>
              <span className="sm:hidden">Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Live Daily Goal & Streak Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md text-xs">
        <div className="flex items-center space-x-1.5 text-slate-300">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          {isWeekend ? (
            <span className="text-amber-300 font-medium">🌴 Weekend Off (Rest Day)</span>
          ) : (
            <span>
              Target: <strong className="text-white">{todaySolved}/{dailyTarget}</strong> {targetMet ? '🎯 Target Hit!' : 'Solved'}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1 text-orange-400 font-semibold bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
          <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
          <span>{streak}d Streak</span>
        </div>
      </div>
    </header>
  );
}
