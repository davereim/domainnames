'use client';

import { useState, useEffect } from 'react';
import StatusBadge from '@/components/StatusBadge';
import type { Name } from '@/types';

const DOMAIN_STATUSES = ['Unknown', 'Available', 'Taken', 'Premium', 'Needs Check'];

interface EditingState {
  id: number;
  notes: string;
  domainStatus: string;
}

export default function ShortlistPage() {
  const [names, setNames] = useState<Name[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [exporting, setExporting] = useState(false);

  async function fetchShortlist() {
    setLoading(true);
    try {
      const res = await fetch('/api/names?status=Shortlist&sortBy=rank&sortDir=asc&pageSize=200');
      const data = await res.json();
      setNames(data.names || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchShortlist(); }, []);

  async function updateRank(id: number, direction: 'up' | 'down') {
    const idx = names.findIndex((n) => n.id === id);
    if (idx === -1) return;
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === names.length - 1) return;

    const newNames = [...names];
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    [newNames[idx], newNames[swapIdx]] = [newNames[swapIdx], newNames[idx]];

    // Update ranks
    const updated = newNames.map((n, i) => ({ ...n, rank: i + 1 }));
    setNames(updated);

    // Persist
    await Promise.all(
      updated.map((n) =>
        fetch(`/api/names/${n.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rank: n.rank }),
        })
      )
    );
  }

  async function removeFromShortlist(id: number) {
    await fetch(`/api/names/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Like', rank: null }),
    });
    setNames((prev) => prev.filter((n) => n.id !== id));
  }

  async function saveEdit() {
    if (!editing) return;
    await fetch(`/api/names/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: editing.notes, domainStatus: editing.domainStatus }),
    });
    setNames((prev) =>
      prev.map((n) =>
        n.id === editing.id
          ? { ...n, notes: editing.notes, domainStatus: editing.domainStatus }
          : n
      )
    );
    setEditing(null);
  }

  async function exportCSV() {
    setExporting(true);
    try {
      const res = await fetch('/api/export?status=Shortlist');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shortlist-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Shortlist</h1>
          <p className="text-sm text-slate-500 mt-1">
            {names.length} shortlisted name{names.length !== 1 ? 's' : ''} — drag or reorder with arrows
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={exporting || names.length === 0}
          className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-40"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {names.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 py-20 text-center">
          <svg className="w-10 h-10 mx-auto mb-3 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
          <p className="text-sm font-medium text-slate-400">No shortlisted names yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Go to <a href="/names" className="text-indigo-500 hover:underline">All Names</a> and click ★ to shortlist a name
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {names.map((name, idx) => (
            <div
              key={name.id}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden"
            >
              <div className="flex items-start gap-4 p-5">
                {/* Rank + controls */}
                <div className="flex flex-col items-center gap-1 min-w-[32px]">
                  <span className="text-xs font-semibold text-slate-300">#{idx + 1}</span>
                  <button
                    onClick={() => updateRank(name.id, 'up')}
                    disabled={idx === 0}
                    className="text-slate-300 hover:text-slate-600 disabled:opacity-20 transition-colors"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => updateRank(name.id, 'down')}
                    disabled={idx === names.length - 1}
                    className="text-slate-300 hover:text-slate-600 disabled:opacity-20 transition-colors"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>

                {/* Name info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{name.name}</h3>
                      <p className="text-xs text-slate-400">{name.category}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-bold ${name.score >= 8 ? 'text-emerald-600' : name.score >= 6.5 ? 'text-blue-600' : 'text-amber-600'}`}>
                        {name.score}/10
                      </span>
                      <StatusBadge status={name.domainStatus} />
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{name.meaning}</p>

                  {name.domainIdea && (
                    <p className="text-xs text-slate-400 font-mono mt-1.5">{name.domainIdea}</p>
                  )}

                  {name.riskNotes && name.riskNotes !== 'No significant risk factors noted' && (
                    <p className="text-xs text-amber-600 mt-1.5 bg-amber-50 px-2.5 py-1.5 rounded-lg">
                      ⚠ {name.riskNotes}
                    </p>
                  )}

                  {/* Notes */}
                  {editing?.id === name.id ? (
                    <div className="mt-3 space-y-2">
                      <select
                        value={editing.domainStatus}
                        onChange={(e) => setEditing({ ...editing, domainStatus: e.target.value })}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {DOMAIN_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <textarea
                        value={editing.notes}
                        onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                        placeholder="Add notes, pros, cons…"
                        rows={2}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(null)} className="text-xs text-slate-500 px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50">Cancel</button>
                        <button onClick={saveEdit} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">Save</button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      {name.notes ? (
                        <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">{name.notes}</p>
                      ) : (
                        <button
                          onClick={() => setEditing({ id: name.id, notes: name.notes || '', domainStatus: name.domainStatus })}
                          className="text-xs text-slate-400 hover:text-slate-600 hover:underline"
                        >
                          + Add notes
                        </button>
                      )}
                      {name.notes && (
                        <button
                          onClick={() => setEditing({ id: name.id, notes: name.notes || '', domainStatus: name.domainStatus })}
                          className="text-xs text-indigo-500 hover:underline ml-2"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setEditing({ id: name.id, notes: name.notes || '', domainStatus: name.domainStatus })}
                    className="text-xs text-slate-400 hover:text-slate-700 border border-slate-200 px-2 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    title="Mark Domain Status"
                  >
                    Domain Status
                  </button>
                  <button
                    onClick={() => removeFromShortlist(name.id)}
                    className="text-xs text-slate-400 hover:text-red-600 border border-slate-200 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
