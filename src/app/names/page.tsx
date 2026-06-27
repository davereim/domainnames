'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import type { Name } from '@/types';

const STATUSES = ['New', 'Like', 'Maybe', 'Reject', 'Shortlist', 'Domain Taken', 'Trademark Concern'];
const DOMAIN_STATUSES = ['Unknown', 'Available', 'Taken', 'Premium', 'Needs Check'];
const CATEGORIES = ['Invented Word', 'Trust & Stewardship', 'Visibility & Clarity', 'Operations & Intelligence', 'Short Modern SaaS', 'Biblical-Root Inspired'];

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color = score >= 8 ? 'bg-emerald-500' : score >= 6.5 ? 'bg-blue-500' : 'bg-amber-400';
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-600 font-medium w-6">{score}</span>
    </div>
  );
}

interface EditRowProps {
  name: Name;
  onClose: () => void;
  onSave: (updated: Name) => void;
}

function EditRow({ name, onClose, onSave }: EditRowProps) {
  const [status, setStatus] = useState(name.status);
  const [domainStatus, setDomainStatus] = useState(name.domainStatus);
  const [notes, setNotes] = useState(name.notes || '');
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/names/${name.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, domainStatus, notes }),
      });
      if (res.ok) {
        const updated = await res.json();
        onSave(updated);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="bg-indigo-50/40 border-b border-indigo-100">
      <td colSpan={7} className="px-5 py-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Domain Status</label>
            <select
              value={domainStatus}
              onChange={(e) => setDomainStatus(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {DOMAIN_STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add a note…"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="mt-3 flex gap-2 items-start">
          <div className="flex-1">
            <p className="text-xs text-slate-500">{name.meaning}</p>
            {name.riskNotes && (
              <p className="text-xs text-amber-600 mt-1">⚠ {name.riskNotes}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5 border border-slate-200 rounded-lg">
              Cancel
            </button>
            <button onClick={save} disabled={saving} className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

function NamesContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || '';

  const [names, setNames] = useState<Name[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);

  const PAGE_SIZE = 50;

  const fetchNames = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      search,
      status: statusFilter,
      category: categoryFilter,
      sortBy,
      sortDir,
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    try {
      const res = await fetch(`/api/names?${params}`);
      const data = await res.json();
      setNames(data.names || []);
      setTotal(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, sortBy, sortDir, page]);

  useEffect(() => { fetchNames(); }, [fetchNames]);

  function handleSort(col: string) {
    if (sortBy === col) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
    setPage(1);
  }

  async function quickStatus(id: number, status: string) {
    await fetch(`/api/names/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchNames();
  }

  function updateName(updated: Name) {
    setNames((prev) => prev.map((n) => n.id === updated.id ? { ...updated, createdAt: String(updated.createdAt), updatedAt: String(updated.updatedAt) } : n));
    setEditingId(null);
  }

  const SortIcon = ({ col }: { col: string }) => (
    <span className="ml-1 text-slate-300">
      {sortBy === col ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
    </span>
  );

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">All Names</h1>
        <p className="text-sm text-slate-500 mt-1">{total} names in database</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search names…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : names.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="text-sm">No names found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th
                    className="text-left px-5 py-3 text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort('name')}
                  >
                    Name <SortIcon col="name" />
                  </th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-slate-500 hidden md:table-cell">Category</th>
                  <th
                    className="text-left px-3 py-3 text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort('score')}
                  >
                    Score <SortIcon col="score" />
                  </th>
                  <th
                    className="text-left px-3 py-3 text-xs font-medium text-slate-500 cursor-pointer hover:text-slate-700"
                    onClick={() => handleSort('status')}
                  >
                    Status <SortIcon col="status" />
                  </th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-slate-500 hidden lg:table-cell">Domain</th>
                  <th className="text-left px-3 py-3 text-xs font-medium text-slate-500 hidden xl:table-cell">Notes</th>
                  <th className="px-3 py-3 text-xs font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {names.map((name) => (
                  <>
                    <tr
                      key={name.id}
                      className="hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={() => setEditingId(editingId === name.id ? null : name.id)}
                    >
                      <td className="px-5 py-3">
                        <p className="font-semibold text-slate-900">{name.name}</p>
                      </td>
                      <td className="px-3 py-3 hidden md:table-cell">
                        <span className="text-xs text-slate-500">{name.category}</span>
                      </td>
                      <td className="px-3 py-3">
                        <ScoreBar score={name.score} />
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={name.status} />
                      </td>
                      <td className="px-3 py-3 hidden lg:table-cell">
                        <StatusBadge status={name.domainStatus} />
                      </td>
                      <td className="px-3 py-3 hidden xl:table-cell">
                        <span className="text-xs text-slate-400 truncate max-w-[120px] block">{name.notes || '—'}</span>
                      </td>
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          {['Like', 'Shortlist', 'Reject'].map((s) => (
                            <button
                              key={s}
                              onClick={() => quickStatus(name.id, s)}
                              title={s}
                              className={`text-xs px-2 py-1 rounded border transition-colors ${
                                name.status === s
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {s === 'Like' ? '♥' : s === 'Shortlist' ? '★' : '✕'}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                    {editingId === name.id && (
                      <EditRow
                        key={`edit-${name.id}`}
                        name={name}
                        onClose={() => setEditingId(null)}
                        onSave={updateName}
                      />
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NamesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-40"><div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <NamesContent />
    </Suspense>
  );
}
