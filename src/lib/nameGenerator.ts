import type { GeneratedName, NamingStyle } from '@/types';

export const STYLE_LABELS: Record<NamingStyle, string> = {
  invented: 'Invented Word',
  trust: 'Trust & Stewardship',
  visibility: 'Visibility & Clarity',
  operations: 'Operations & Intelligence',
  modern: 'Short Modern SaaS',
  biblical: 'Biblical-Root Inspired',
};

export const STYLE_DESCRIPTIONS: Record<NamingStyle, string> = {
  invented: 'Coined words derived from theme words — modern, distinct, brandable',
  trust: 'Names evoking reliability, stewardship, and confident management',
  visibility: 'Names emphasizing clarity, sight, and transparent insight',
  operations: 'Names combining operational intelligence with compound suffixes',
  modern: 'Short, punchy, SaaS-native names — think Stripe, Linear, Ramp',
  biblical: 'Names with ancient roots — timeless but not overtly religious',
};

const STYLE_SUFFIXES: Record<NamingStyle, string[]> = {
  invented: ['ix', 'ra', 'va', 'ora', 'ova', 'io', 'ia', 'en', 'on', 'ex', 'elo', 'ela', 'ari', 'eri', 'tra', 'dra', 'ova', 'yx'],
  trust: ['keep', 'ward', 'safe', 'base', 'core', 'bond', 'hold', 'mark', 'seal'],
  visibility: ['sight', 'view', 'scan', 'beam', 'lens', 'scope', 'cast', 'peek'],
  operations: ['ops', 'iq', 'hq', 'hub', 'base', 'wire', 'stack', 'ai'],
  modern: ['ly', 'ify', 'io', 'co', 'fy'],
  biblical: ['el', 'ia', 'ah', 'on', 'ara', 'iel', 'ith', 'ael', 'im', 'ori'],
};

const STYLE_PREFIXES: Record<NamingStyle, string[]> = {
  invented: ['meta', 'omni', 'neo', 'syn', 'para'],
  trust: ['true', 'sure', 'wise', 'clear'],
  visibility: ['clear', 'bright', 'wide', 'open'],
  operations: ['smart', 'wise', 'meta', 'omni'],
  modern: ['get', 'my', 'go'],
  biblical: ['eli', 'avi', 'ori'],
};

// Patterns that produce good-sounding invented names from a stem
const INVENTED_PATTERNS: Array<(stem: string) => string> = [
  (s) => s.slice(0, 3) + 'ora',
  (s) => s.slice(0, 4) + 'ix',
  (s) => s.slice(0, 3) + 'va',
  (s) => s.slice(0, 4) + 'ra',
  (s) => s.slice(0, 3) + 'elo',
  (s) => s.slice(0, 4) + 'io',
  (s) => s.slice(0, 3) + 'ari',
  (s) => s.slice(0, 4) + 'tra',
  (s) => s.slice(0, 3) + 'ova',
  (s) => s.slice(0, 5) + 'ia',
  (s) => s.slice(0, 3) + 'eri',
  (s) => s.slice(0, 4) + 'ela',
  (s) => s.slice(0, 4) + 'on',
  (s) => s.slice(0, 3) + 'ex',
];

const MEANINGS: Record<NamingStyle, string[]> = {
  invented: [
    'A coined word derived from "{root}" — modern, distinct, and brandable without being literal',
    'Invented from the concept of {root}, with a contemporary suffix that adds energy and forward momentum',
    'A fresh take on {root} — the name suggests innovation and clarity without being heavy-handed',
    'Derived from {root}, shaped into a unique brand identity that stands on its own',
    'A modern coined name rooted in {root} — easy to say, easy to remember',
  ],
  trust: [
    'Built on the idea of {root} — this name signals reliability and responsible stewardship',
    'Combines {root} with a sense of trustworthy, dependable management',
    'Evokes safe, confident oversight grounded in {root}',
    'Suggests that {root} is in good hands — secure, managed, accountable',
    'A name that reassures: your {root} is well-stewarded',
  ],
  visibility: [
    'Emphasizes clarity and visibility of {root} — you can see clearly now',
    'Makes {root} visible and understandable at a glance',
    'Evokes the power to see and understand {root} in full context',
    'Brings transparency and light to {root}',
    'Suggests a clear, unobstructed view of {root} across your business',
  ],
  operations: [
    'Intelligent operations rooted in {root} — smart, actionable, efficient',
    'Positions the product as an operational intelligence layer for {root}',
    'An intelligence-driven approach to {root} — management with an IQ',
    'Combines operational precision with real-time {root} awareness',
    'Smart ops, centered on {root} — the system that runs so you don\'t have to',
  ],
  modern: [
    'Short and direct — focused on {root}, built for modern teams moving fast',
    'A clean, punchy name that puts {root} front and center without clutter',
    'Minimal and memorable — {root} in its most modern, deployable form',
    'Fast, lean, and centered on {root} — the way modern SaaS should feel',
    'The kind of name you can say on a Zoom call — built around {root}',
  ],
  biblical: [
    'A name with ancient roots, evoking enduring strength and clarity around {root}',
    'Timeless and grounded — classical in sound, modern in purpose for {root}',
    'Draws on cultural depth to frame {root} with quiet authority',
    'Ancient-rooted but instantly modern — suggests lasting mastery of {root}',
    'A name that has survived millennia, now applied to {root} for the modern age',
  ],
};

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function isPronounceable(name: string): boolean {
  const lower = name.toLowerCase();
  if (/[bcdfghjklmnpqrstvwxyz]{3}/i.test(lower)) return false;
  if (!/[aeiou]/i.test(lower)) return false;
  if (lower.length < 3) return false;
  return true;
}

function scoreName(name: string, style: NamingStyle): number {
  let score = 7.0;

  const len = name.length;
  if (len >= 5 && len <= 7) score += 1.0;
  else if (len === 8) score += 0.5;
  else if (len === 4) score += 0.0;
  else if (len >= 9 && len <= 10) score -= 0.5;
  else if (len > 10) score -= 1.5;

  if (/[aeiou]$/i.test(name)) score += 0.5;
  if (/^[bcdfgklmnprstvw]/i.test(name)) score += 0.3;
  if (/[bcdfghjklmnpqrstvwxyz]{3,}/i.test(name.toLowerCase())) score -= 1.0;

  const vowelCount = (name.match(/[aeiou]/gi) || []).length;
  const ratio = vowelCount / name.length;
  if (ratio >= 0.28 && ratio <= 0.50) score += 0.3;

  if (style === 'invented' || style === 'modern') score += 0.2;

  score += (Math.random() - 0.5) * 0.8;

  return Math.max(4.0, Math.min(10.0, Math.round(score * 10) / 10));
}

function getRiskNote(name: string, style: NamingStyle): string {
  const notes: string[] = [];

  if (name.length > 9) notes.push('Longer names may be harder to use as a primary domain');
  if (/iq$/i.test(name)) notes.push('IQ suffix is common in SaaS — verify distinctiveness');
  if (/ops$/i.test(name)) notes.push('Ops suffix is widely used — check competitive landscape');
  if (/hq$/i.test(name)) notes.push('HQ suffix has broad use — verify trademark availability');
  if (style === 'trust') notes.push('Trust/Safe terminology can sound generic — pair with strong visual identity');
  if (style === 'operations') notes.push('Check for existing tools with similar Ops-style compound names');

  return notes.length > 0 ? notes.join('. ') : 'No significant risk factors noted';
}

function getDomainIdeas(name: string): string {
  const lower = name.toLowerCase();
  return [`${lower}.com`, `get${lower}.com`, `${lower}hq.com`].join(', ');
}

function getMeaning(style: NamingStyle, rootWord: string): string {
  const template = randomFrom(MEANINGS[style]);
  return template.replace(/\{root\}/g, rootWord.toLowerCase());
}

function generateSuffixName(word: string, style: NamingStyle): string | null {
  const suffixes = STYLE_SUFFIXES[style];
  const suffix = randomFrom(suffixes);
  const lower = word.toLowerCase();

  const stemLen = Math.min(lower.length, 3 + Math.floor(Math.random() * 4));
  let stem = lower.slice(0, stemLen);

  // Avoid double vowel at junction
  if (/[aeiou]$/.test(stem) && /^[aeiou]/.test(suffix)) {
    stem = stem.slice(0, -1);
  }

  const name = stem + suffix;
  if (!isPronounceable(name) || name.length < 4 || name.length > 11) return null;
  return capitalize(name);
}

function generatePrefixName(word: string, style: NamingStyle): string | null {
  const prefixes = STYLE_PREFIXES[style];
  if (!prefixes.length) return null;

  const prefix = randomFrom(prefixes);
  const lower = word.toLowerCase();
  const wordPart = lower.slice(0, Math.min(lower.length, 6));

  const name = prefix + capitalize(wordPart);
  if (!isPronounceable(name) || name.length < 5 || name.length > 12) return null;
  return name;
}

function generateFusion(word1: string, word2: string): string | null {
  if (word1.toLowerCase() === word2.toLowerCase()) return null;

  const w1 = word1.toLowerCase();
  const w2 = word2.toLowerCase();

  const options = [
    w1.slice(0, Math.ceil(w1.length / 2)) + w2.slice(Math.floor(w2.length / 2)),
    w1.slice(0, 3) + w2.slice(0, 4),
    w1.slice(0, 4) + w2.slice(w2.length - 3),
  ];

  const result = randomFrom(options);
  if (!result || !isPronounceable(result) || result.length < 4 || result.length > 10) return null;
  return capitalize(result);
}

function generateInventedName(word: string): string | null {
  const lower = word.toLowerCase();
  const pattern = randomFrom(INVENTED_PATTERNS);
  const result = pattern(lower);

  if (!result || !isPronounceable(result) || result.length < 4 || result.length > 10) return null;
  return capitalize(result);
}

function generateCompoundName(word1: string, word2: string, style: NamingStyle): string | null {
  const suffixes = STYLE_SUFFIXES[style];
  const w1 = word1.toLowerCase();
  const w2 = word2.toLowerCase();

  const options = [
    () => w1 + randomFrom(suffixes),
    () => w1.slice(0, 4) + randomFrom(suffixes),
    () => capitalize(w1) + w2.slice(0, 2).toUpperCase(),
    () => w1.slice(0, 5) + w2.slice(0, 2),
  ];

  const result = randomFrom(options)();
  if (!result || !isPronounceable(result) || result.length < 4 || result.length > 12) return null;
  return capitalize(result);
}

// Words to exclude from the output (actual dictionary words or seed words)
const FILTER_WORDS = new Set([
  'sense', 'signal', 'pulse', 'clarity', 'map', 'graph', 'link', 'steward',
  'control', 'visibility', 'intelligence', 'context', 'memory', 'trust',
  'insight', 'foundation', 'beacon', 'compass', 'anchor', 'layer', 'core',
  'fabric', 'thread', 'weave', 'orbit', 'nexus', 'relay', 'current', 'source',
  'stack', 'clear', 'bright', 'smart', 'wise', 'meta', 'open', 'base', 'hold',
  'bond', 'ward', 'safe', 'keep', 'mark', 'scan', 'view', 'lens', 'beam',
  'cast', 'hub', 'wire', 'true', 'sure', 'sight', 'scope', 'ion', 'aria',
  'era', 'opera', 'idea', 'area',
]);

export function generateNames(
  themeWords: string[],
  style: NamingStyle,
  count: number
): GeneratedName[] {
  const results: GeneratedName[] = [];
  const seen = new Set<string>();
  let attempts = 0;
  const maxAttempts = count * 25;

  while (results.length < count && attempts < maxAttempts) {
    attempts++;

    const word = randomFrom(themeWords);
    const word2 = randomFrom(themeWords);

    const techniques: string[] = ['suffix', 'fusion', 'compound', 'invented'];
    if (STYLE_PREFIXES[style].length > 0) techniques.push('prefix');

    const technique = randomFrom(techniques);
    let generatedName: string | null = null;
    let rootWord = word;

    switch (technique) {
      case 'suffix':
        generatedName = generateSuffixName(word, style);
        break;
      case 'prefix':
        generatedName = generatePrefixName(word, style);
        break;
      case 'fusion':
        generatedName = generateFusion(word, word2);
        rootWord = `${word} + ${word2}`;
        break;
      case 'compound':
        generatedName = generateCompoundName(word, word2, style);
        break;
      case 'invented':
        generatedName = generateInventedName(word);
        break;
    }

    if (!generatedName) continue;

    const lower = generatedName.toLowerCase();
    if (FILTER_WORDS.has(lower)) continue;
    if (seen.has(lower)) continue;
    if (generatedName.length < 4 || generatedName.length > 12) continue;

    seen.add(lower);

    const primaryRoot = rootWord.split(' + ')[0];

    results.push({
      name: generatedName,
      meaning: getMeaning(style, primaryRoot),
      category: STYLE_LABELS[style],
      score: scoreName(generatedName, style),
      riskNotes: getRiskNote(generatedName, style),
      domainIdea: getDomainIdeas(generatedName),
    });
  }

  return results.sort((a, b) => b.score - a.score);
}

export const SEED_WORDS = [
  'Sense', 'Signal', 'Pulse', 'Clarity', 'Map', 'Graph', 'Link',
  'Steward', 'Control', 'Visibility', 'Intelligence', 'Context',
  'Memory', 'Trust', 'Insight', 'Foundation', 'Beacon', 'Compass',
  'Anchor', 'Layer', 'Core', 'Fabric', 'Thread', 'Weave', 'Orbit',
  'Nexus', 'Relay', 'Current', 'Source', 'Stack',
];
