'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { initStore, getStats } from '@/lib/store';
import type { Name } from '@/types';

function ScoreBar({ score }: { score: number }) {
  const pct = (score / 10) * 100;
  const color = score >= 8 ? 'bg-emerald-500' : score >= 6.5 ? 'bg-blue-500' : 'bg-amber-400';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-600 font-medium w-6 text-right">{score}</span>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<{
    total: number; shortlisted: number; liked: number; rejected: number;
    averageScore: number; recent: Name[];
  }>({ total: 0, shortlisted: 0, liked: 0, rejected: 0, averageScore: 0, recent: [] });

  useEffect(() => {
    initStore();
    setStats(getStats());
  }, []);

  const statCards = [
    { label: 'Total Names', value: stats.total, color: 'text-slate-900', bg: 'bg-white', href: '/names' },
    { label: 'Shortlisted', value: stats.shortlisted, color: 'text-emerald-700', bg: 'bg-emerald-50', href: '/shortlist' },
    { label: 'Liked', value: stats.liked, color: 'text-blue-700', bg: 'bg-blue-50', href: '/names?status=Like' },
    { label: 'Rejected', value: stats.rejected, color: 'text-red-700', bg: 'bg-red-50', href: '/names?status=Reject' },
    { label: 'Avg Score', value: stats.averageScore > 0 ? stats.averageScore.toFixed(1) : '—', color: 'text-indigo-700', bg: 'bg-indigo-50', href: '/names' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Your SaaS naming research overview</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className={`${card.bg} rounded-xl p-4 border border-slate-100 hover:shadow-sm transition-shadow`}
          >
            <p className="text-xs font-medium text-slate-500 mb-1">{card.label}</p>
            <p className={`text-2xl font-semibold ${card.color}`}>{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-8">
        <Link
          href="/generate"
          className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-4 transition-colors"
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <div>
            <p className="font-medium text-sm">Generate Names</p>
            <p className="text-xs text-indigo-200">Create new candidates</p>
          </div>
        </Link>
        <Link
          href="/names"
          className="flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl px-5 py-4 border border-slate-200 transition-colors"
        >
          <svg className="w-5 h-5 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <div>
            <p className="font-medium text-sm">Review Names</p>
            <p className="text-xs text-slate-400">Filter, sort, update</p>
          </div>
        </Link>
        <Link
          href="/prompt-builder"
          className="flex items-center gap-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl px-5 py-4 border border-slate-200 transition-colors"
        >
          <svg className="w-5 h-5 flex-shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
          <div>
            <p className="font-medium text-sm">Prompt Builder</p>
            <p className="text-xs text-slate-400">Build AI prompts</p>
          </div>
        </Link>
      </div>

      {stats.recent.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Recent Names</h2>
            <Link href="/names" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {stats.recent.map((name) => (
              <div key={name.id} className="flex items-center gap-4 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{name.name}</p>
                  <p className="text-xs text-slate-400 truncate">{name.category}</p>
                </div>
                <div className="w-28 hidden sm:block">
                  <ScoreBar score={name.score} />
                </div>
                <StatusBadge status={name.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.total === 0 && (
        <div className="text-center py-16 text-slate-400">
          <svg className="w-10 h-10 mx-auto mb-3 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          <p className="text-sm font-medium text-slate-400">No names yet</p>
          <p className="text-xs mt-1">
            <Link href="/generate" className="text-indigo-500 hover:underline">Generate your first batch</Link>
          </p>
        </div>
      )}
    </div>
  );
}
