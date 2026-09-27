import React, { useState } from 'react';
import { X, UploadCloud, FileCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_BASE } from '../config';

export default function ImportModal({ isOpen, onClose, onImportSuccess }) {
  const [sheetName, setSheetName] = useState('Imported Custom Sheet');
  const [rawText, setRawText] = useState('');
  const [format, setFormat] = useState('lines'); // 'lines' | 'json' | 'csv'
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);

  if (!isOpen) return null;

  const handleImport = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setResultMsg(null);

    try {
      let parsedProblems = [];

      if (format === 'json') {
        parsedProblems = JSON.parse(rawText);
      } else if (format === 'csv') {
        const rows = rawText.split('\n').filter(r => r.trim());
        parsedProblems = rows.slice(1).map((r, i) => {
          const cols = r.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
          return {
            problemNumber: i + 1,
            title: cols[0] || 'Untitled',
            url: cols[1] || `https://leetcode.com/problemset/all/?search=${encodeURIComponent(cols[0] || '')}`,
            difficulty: cols[2] || 'Medium',
            topic: cols[3] || 'General'
          };
        });
      } else {
        // Line-by-line format: Title | URL | Difficulty | Topic
        const lines = rawText.split('\n').filter(l => l.trim());
        parsedProblems = lines.map((line, i) => {
          const parts = line.split(/[|,]/).map(p => p.trim());
          return {
            problemNumber: i + 1,
            title: parts[0] || `Problem ${i + 1}`,
            url: parts[1] || `https://leetcode.com/problemset/all/?search=${encodeURIComponent(parts[0] || '')}`,
            difficulty: ['Easy', 'Medium', 'Hard'].includes(parts[2]) ? parts[2] : 'Medium',
            topic: parts[3] || 'General'
          };
        });
      }

      const token = localStorage.getItem('leetpulse_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/problems/bulk-import`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          sheetName,
          problems: parsedProblems
        })
      });

      const data = await res.json();
      if (data.success) {
        setResultMsg({ type: 'success', text: `Successfully imported ${data.count} problems!` });
        setTimeout(() => {
          onImportSuccess();
          onClose();
        }, 1200);
      } else {
        setResultMsg({ type: 'error', text: data.message || 'Import failed.' });
      }
    } catch (err) {
      setResultMsg({ type: 'error', text: 'Failed to parse format: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Import DSA Problem Sheet</h3>
              <p className="text-xs text-slate-400">Add custom problems from CSV, JSON, or text lists</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Custom Sheet Name:
            </label>
            <input
              type="text"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              placeholder="e.g. Striver SDE Sheet / Company Focus"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">Format:</label>
            <div className="flex items-center space-x-2 text-xs">
              {['lines', 'csv', 'json'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-2.5 py-1 rounded-lg uppercase text-[11px] font-medium transition ${
                    format === f
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={
                format === 'json'
                  ? `[\n  {\n    "title": "Two Sum",\n    "url": "https://leetcode.com/problems/two-sum/",\n    "difficulty": "Easy",\n    "topic": "Arrays"\n  }\n]`
                  : format === 'csv'
                  ? `Title,URL,Difficulty,Topic\nTwo Sum,https://leetcode.com/problems/two-sum/,Easy,Arrays`
                  : `Two Sum | https://leetcode.com/problems/two-sum/ | Easy | Arrays\n3Sum | https://leetcode.com/problems/3sum/ | Medium | Two Pointers`
              }
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed"
            />
          </div>

          {resultMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
                resultMsg.type === 'success'
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              }`}
            >
              {resultMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{resultMsg.text}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={loading || !rawText.trim()}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center space-x-1.5 disabled:opacity-50 transition"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{loading ? 'Importing...' : 'Start Import'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
