'use client';

import type { Name } from '@/types';
import { SEED_WORDS, EXAMPLE_NAMES } from './seedData';

const NAMES_KEY = 'naming_lab_names';
const ID_KEY = 'naming_lab_next_id';
const SEEDED_KEY = 'naming_lab_seeded';

function nextId(): number {
  const id = parseInt(localStorage.getItem(ID_KEY) || '1');
  localStorage.setItem(ID_KEY, String(id + 1));
  return id;
}

export function initStore(): void {
  if (localStorage.getItem(SEEDED_KEY)) return;
  const names: Name[] = EXAMPLE_NAMES.map((n, i) => ({
    id: i + 1,
    name: n.name,
    category: n.category,
    meaning: n.meaning,
    score: n.score,
    domainIdea: n.domainIdea,
    domainStatus: 'Unknown',
    status: n.status,
    notes: null,
    riskNotes: n.riskNotes,
    rank: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  localStorage.setItem(NAMES_KEY, JSON.stringify(names));
  localStorage.setItem(ID_KEY, String(names.length + 1));
  localStorage.setItem(SEEDED_KEY, '1');
}

export function getNames(): Name[] {
  try {
    return JSON.parse(localStorage.getItem(NAMES_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveNames(names: Name[]): void {
  localStorage.setItem(NAMES_KEY, JSON.stringify(names));
}

export function createName(data: Omit<Name, 'id' | 'createdAt' | 'updatedAt'>): Name | null {
  const names = getNames();
  if (names.some(n => n.name.toLowerCase() === data.name.toLowerCase())) return null;
  const name: Name = {
    ...data,
    id: nextId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  names.push(name);
  saveNames(names);
  return name;
}

export function updateName(id: number, data: Partial<Name>): Name | null {
  const names = getNames();
  const idx = names.findIndex(n => n.id === id);
  if (idx === -1) return null;
  names[idx] = { ...names[idx], ...data, updatedAt: new Date().toISOString() };
  saveNames(names);
  return names[idx];
}

export function deleteNames(ids: number[]): void {
  saveNames(getNames().filter(n => !ids.includes(n.id)));
}

export function getStats() {
  const names = getNames();
  const scores = names.map(n => n.score);
  return {
    total: names.length,
    shortlisted: names.filter(n => n.status === 'Shortlist').length,
    liked: names.filter(n => n.status === 'Like').length,
    rejected: names.filter(n => n.status === 'Reject').length,
    averageScore: scores.length
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0,
    recent: [...names].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8),
  };
}

export { SEED_WORDS };
