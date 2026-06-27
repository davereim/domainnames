'use client';

import { useState } from 'react';
import StatusBadge from '@/components/StatusBadge';
import type { GeneratedName, NamingStyle } from '@/types';
import { STYLE_LABELS, STYLE_DESCRIPTIONS, SEED_WORDS, generateNames } from '@/lib/nameGenerator';
import { initStore, createName } from '@/lib/store';

const BATCH_SIZES = [30, 100, 500];
const STYLES: NamingStyle[] = ['invented', 'trust', 'visibility', 'operations', 'modern', 'biblical'];

function ScoreChip({ score }: { score: number }) {
  const color = score >= 8 ? 'text-emerald-700 bg-emerald-50' : score >= 6.5 ? 'text-blue-700 bg-blue-50' : 'text-amber-700 bg-amber-50';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
      {score.toFixed(1)}
    </span>
  );
}

export default function GeneratePage() {
  const [selectedWords, setSelectedWords] = useState<string[]>(SEED_WORDS.slice(0, 8));
  const [style, setStyle] = useState<NamingStyle>('invented');
  const [batchSize, setBatchSize] = useState(30);
  const [results, setResults] = useState<GeneratedName[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [error, setError] = useState('');

  function toggleWord(word: string) {
    setSelectedWords((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]
    );
  }

  function toggleAll() {
    setSelectedWords(selectedWords.length === SEED_WORDS.length ? [] : [...SEED_WORDS]);
  }

  function handleGenerate() {
    if (selectedWords.length === 0) {
      setError('Select at least one theme word');
      return;
    }
    setError('');
    setLoading(true);
    setResults([]);
    setSelected(new Set());
    setSavedCount(0);

    // Run generator (CPU-bound but fast enough for client)
    setTimeout(() => {
      try {
        const names = generateNames(selectedWords, style, batchSize);
        setResults(names);
        setSelected(new Set(names.map((_: GeneratedName, i: number) => i)));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Generation failed');
      } finally {
        setLoading(false);
      }
    }, 0);
  }

  function handleSave() {
    const toSave = results.filter((_, i) => selected.has(i));
    if (toSave.length === 0) return;

    setSaving(true);
    initStore();
    let saved = 0;

    for (const name of toSave) {
      const created = createName({
        name: name.name,
        category: name.category,
        meaning: name.meaning,
        score: name.score,
        domainIdea: name.domainIdea,
        domainStatus: 'Unknown',
        status: 'New',
        notes: null,
        riskNotes: name.riskNotes,
        rank: null,
      });
      if (created) saved++;
    }

    setSavedCount(saved);
    setSaving(false);
  }

  function toggleSelect(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelected((prev) =>
      prev.size === results.length ? new Set() : new Set(results.map((_, i) => i))
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Generate Names</h1>
        <p className="text-sm text-slate-500 mt-1">Select theme words and a style, then generate a batch of brandable names</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Options panel */}
        <div className="lg:col-span-1 space-y-5">

          {/* Naming Style */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Naming Style</h2>
            <div className="space-y-2">
              {STYLES.map((s) => (
                <label
                  key={s}
                  className={`flex items-start gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${
                    style === s ? 'bg-indigo-50 border border-indigo-200' : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <input
                    type="radio"
                    name="style"
                    value={s}
                    checked={style === s}
                    onChange={() => setStyle(s)}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <div>
                    <p className={`text-sm font-medium ${style === s ? 'text-indigo-700' : 'text-slate-700'}`}>
                      {STYLE_LABELS[s]}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 leading-snug">{STYLE_DESCRIPTIONS[s]}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Batch size */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h2 className="text-sm font-semibold text-slate-800 mb-3">Batch Size</h2>
            <div className="flex gap-2">
              {BATCH_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setBatchSize(size)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    batchSize === size
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Theme words */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-800">Theme Words</h2>
              <button
                onClick={toggleAll}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
              >
                {selectedWords.length === SEED_WORDS.length ? 'Clear all' : 'Select all'}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SEED_WORDS.map((word) => (
                <button
                  key={word}
                  onClick={() => toggleWord(word)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedWords.includes(word)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2">{selectedWords.length} selected</p>
          </div>

          {/* Generate button */}
          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? 'Generating…' : `Generate ${batchSize} Names`}
          </button>
        </div>

        {/* Right: Results */}
        <div className="lg:col-span-2">
          {results.length === 0 && !loading && (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 flex items-center justify-center h-64 text-slate-400">
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto mb-2 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                <p className="text-sm font-medium">Configure options and click Generate</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-xl border border-slate-200 flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm text-slate-500">Generating {batchSize} names…</p>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected.size === results.length}
                    onChange={toggleSelectAll}
                    className="accent-indigo-600"
                  />
                  <span className="text-sm text-slate-600">
                    <span className="font-medium text-slate-900">{results.length}</span> generated
                    {selected.size > 0 && ` · ${selected.size} selected`}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {savedCount > 0 && (
                    <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full">
                      {savedCount} saved
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving || selected.size === 0}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-200 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {saving ? 'Saving…' : `Save ${selected.size} to Database`}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="w-8 px-4 py-2.5"></th>
                      <th className="text-left px-3 py-2.5 text-xs font-medium text-slate-500">Name</th>
                      <th className="text-left px-3 py-2.5 text-xs font-medium text-slate-500 hidden md:table-cell">Category</th>
                      <th className="text-left px-3 py-2.5 text-xs font-medium text-slate-500">Score</th>
                      <th className="text-left px-3 py-2.5 text-xs font-medium text-slate-500 hidden lg:table-cell">Domain Ideas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {results.map((name, i) => (
                      <tr
                        key={i}
                        className={`hover:bg-slate-50 transition-colors ${selected.has(i) ? 'bg-indigo-50/30' : ''}`}
                      >
                        <td className="px-4 py-2.5">
                          <input
                            type="checkbox"
                            checked={selected.has(i)}
                            onChange={() => toggleSelect(i)}
                            className="accent-indigo-600"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="font-semibold text-slate-900">{name.name}</p>
                          <p className="text-xs text-slate-400 leading-snug line-clamp-2 max-w-xs">{name.meaning}</p>
                        </td>
                        <td className="px-3 py-2.5 hidden md:table-cell">
                          <span className="text-xs text-slate-500">{name.category}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <ScoreChip score={name.score} />
                        </td>
                        <td className="px-3 py-2.5 hidden lg:table-cell">
                          <p className="text-xs text-slate-400 font-mono">{name.domainIdea}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
