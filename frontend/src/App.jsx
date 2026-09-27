import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import StatsCards from './components/StatsCards';
import AnalyticsSection from './components/AnalyticsSection';
import ProblemTable from './components/ProblemTable';
import NotesModal from './components/NotesModal';
import ImportModal from './components/ImportModal';
import AddProblemModal from './components/AddProblemModal';
import AuthModal from './components/AuthModal';
import { API_BASE } from './config';

export default function App() {
  // Authentication State
  const [token, setToken] = useState(() => localStorage.getItem('leetpulse_token'));
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('leetpulse_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Problem & Analytics Data
  const [problems, setProblems] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSheet, setSelectedSheet] = useState('all');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedRevision, setSelectedRevision] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [starredOnly, setStarredOnly] = useState(false);

  // Other Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [notesProblem, setNotesProblem] = useState(null);

  // Helper for auth headers
  const getAuthHeaders = useCallback(() => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [token]);

  // Validate session on mount
  useEffect(() => {
    if (token) {
      fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.user) {
            setCurrentUser(data.user);
            localStorage.setItem('leetpulse_user', JSON.stringify(data.user));
          } else {
            // Token expired or invalid
            handleLogout();
          }
        })
        .catch(() => {});
    }
  }, [token]);

  // Fetch Analytics
  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/analytics`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  }, [getAuthHeaders]);

  // Fetch Problems
  const fetchProblems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSheet !== 'all') params.append('sheet', selectedSheet);
      if (selectedTopic !== 'all') params.append('topic', selectedTopic);
      if (selectedDifficulty !== 'all') params.append('difficulty', selectedDifficulty);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedRevision !== 'all') params.append('revisionStatus', selectedRevision);
      if (starredOnly) params.append('isStarred', 'true');
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`${API_BASE}/api/problems?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (data.success) {
        setProblems(data.data);
      }
    } catch (err) {
      console.error('Failed to load problems:', err);
    } finally {
      setLoading(false);
    }
  }, [
    selectedSheet,
    selectedTopic,
    selectedDifficulty,
    selectedStatus,
    selectedRevision,
    starredOnly,
    searchQuery,
    getAuthHeaders
  ]);

  // Re-fetch on filter or token changes
  useEffect(() => {
    fetchAnalytics();
    fetchProblems();
  }, [fetchAnalytics, fetchProblems]);

  // Handle Login / Signup Success
  const handleAuthSuccess = (newToken, newUser) => {
    setToken(newToken);
    setCurrentUser(newUser);
    localStorage.setItem('leetpulse_token', newToken);
    localStorage.setItem('leetpulse_user', JSON.stringify(newUser));
  };

  // Handle Logout
  const handleLogout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('leetpulse_token');
    localStorage.removeItem('leetpulse_user');
  };

  // Optimistic update for problem actions
  const handleUpdateProblem = async (problemId, updates) => {
    setProblems((prev) =>
      prev.map((p) => (p._id === problemId ? { ...p, ...updates } : p))
    );

    try {
      const res = await fetch(`${API_BASE}/api/problems/${problemId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (data.success) {
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Failed to update problem:', err);
      fetchProblems();
    }
  };

  // Quick Filter clicks
  const handleQuickFilter = (filter) => {
    if (filter.isStarred !== undefined) {
      setStarredOnly(filter.isStarred);
    }
    if (filter.revisionStatus !== undefined) {
      if (filter.revisionStatus === 'all-flagged') {
        setSelectedRevision('Need Revise');
      } else {
        setSelectedRevision(filter.revisionStatus);
      }
    }
    if (filter.status !== undefined) {
      setSelectedStatus(filter.status);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Background glow accents */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/3 right-1/4 w-[30rem] h-[30rem] bg-cyan-600/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 1. Header Navbar */}
      <Navbar
        dailyGoal={analytics?.dailyGoal}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenAdd={() => setIsAddOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onRefresh={() => {
          fetchAnalytics();
          fetchProblems();
        }}
        loading={loading}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner if not logged in */}
        {!currentUser && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h3 className="text-sm font-bold text-white">Create an Account to Track Your Progress</h3>
                <p className="text-xs text-slate-400">
                  Verify your email via OTP to unlock persistent daily 5-problem streaks, personal revision tags, and notes.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition shrink-0"
            >
              Sign Up / Sign In
            </button>
          </div>
        )}

        {/* 2. Top Stats Overview */}
        <StatsCards
          summary={analytics?.summary}
          dailyGoal={analytics?.dailyGoal}
          difficulties={analytics?.difficulties}
          onQuickFilter={handleQuickFilter}
        />

        {/* 3. Analytics Hub */}
        <AnalyticsSection
          topics={analytics?.topics || []}
          sheets={analytics?.sheets || []}
          recentActivity={analytics?.recentActivity || []}
          activeTopic={selectedTopic}
          onSelectTopic={(topic) => setSelectedTopic(topic)}
        />

        {/* 4. Problems Explorer */}
        <ProblemTable
          problems={problems}
          loading={loading}
          selectedSheet={selectedSheet}
          onChangeSheet={setSelectedSheet}
          selectedTopic={selectedTopic}
          onChangeTopic={setSelectedTopic}
          selectedDifficulty={selectedDifficulty}
          onChangeDifficulty={setSelectedDifficulty}
          selectedStatus={selectedStatus}
          onChangeStatus={setSelectedStatus}
          selectedRevision={selectedRevision}
          onChangeRevision={setSelectedRevision}
          searchQuery={searchQuery}
          onChangeSearch={setSearchQuery}
          starredOnly={starredOnly}
          onToggleStarredOnly={() => setStarredOnly((prev) => !prev)}
          onUpdateProblem={handleUpdateProblem}
          onOpenNotes={(problem) => setNotesProblem(problem)}
          dailyGoal={analytics?.dailyGoal}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 text-center text-xs text-slate-500">
        <p>LeetPulse FAANG DSA Mastery • Connected to MongoDB Atlas • 5 Questions/Day Target with Weekends Off</p>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <NotesModal
        problem={notesProblem}
        isOpen={Boolean(notesProblem)}
        onClose={() => setNotesProblem(null)}
        onSave={handleUpdateProblem}
      />

      <ImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={() => {
          fetchAnalytics();
          fetchProblems();
        }}
      />

      <AddProblemModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddSuccess={() => {
          fetchAnalytics();
          fetchProblems();
        }}
        topics={analytics?.topics || []}
      />
    </div>
  );
}
