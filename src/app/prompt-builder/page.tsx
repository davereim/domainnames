'use client';

import { useState } from 'react';
import { STYLE_LABELS, SEED_WORDS } from '@/lib/nameGenerator';
import type { NamingStyle } from '@/types';

const STYLES: NamingStyle[] = ['invented', 'trust', 'visibility', 'operations', 'modern', 'biblical'];
const LENGTH_OPTIONS = ['4-5 characters', '5-7 characters', '6-8 characters', '7-10 characters', 'any length'];
const COUNT_OPTIONS = [10, 20, 30, 50, 100];

function buildPrompt(opts: {
  coreWords: string;
  avoidWords: string;
  style: NamingStyle;
  length: string;
  count: number;
  extraContext: string;
}): string {
  const styleDescriptions: Record<NamingStyle, string> = {
    invented: 'invented/coined words that don\'t exist in English — think Figma, Asana, Vanta, Virelo, Nexora',
    trust: 'names evoking trust, reliability, and responsible stewardship — safe, dependable, accountable',
    visibility: 'names evoking clarity, transparency, and visibility — seeing and understanding clearly',
    operations: 'names combining operational intelligence — Ops, IQ, Hub, Stack-style compound names',
    modern: 'short, punchy modern SaaS names — 4-7 characters, like Ramp, Linear, Stripe, Notion',
    biblical: 'names with ancient/biblical roots that feel timeless — not overtly religious, just historically rooted',
  };

  const productContext = `We are building a SaaS product for small businesses that gives visibility into their digital business — what they own, who has access, what depends on what, what may break, what they're paying for, and what actions to take next. It's an operating intelligence layer: visibility, clarity, stewardship, trust, control, signal, dependency mapping, and digital ownership.`;

  const lines: string[] = [
    `You are a professional brand naming consultant specialising in SaaS company names.`,
    ``,
    `## Product Context`,
    productContext,
    ``,
    `## Task`,
    `Generate ${opts.count} unique, brandable SaaS company name candidates.`,
    ``,
    `## Naming Style`,
    `Focus on: ${styleDescriptions[opts.style]}`,
    ``,
    `## Core Theme Words to Draw From`,
    opts.coreWords || SEED_WORDS.slice(0, 12).join(', '),
    ``,
  ];

  if (opts.avoidWords) {
    lines.push(`## Words and Patterns to Avoid`);
    lines.push(opts.avoidWords);
    lines.push(``);
  }

  lines.push(`## Name Requirements`);
  lines.push(`- Length: ${opts.length}`);
  lines.push(`- Easy to say aloud and spell from memory`);
  lines.push(`- Suitable as a .com domain (short, no hyphens)`);
  lines.push(`- Not generic, not overly IT/enterprise/cybersecurity-sounding`);
  lines.push(`- Avoid names ending in -ware, -soft, -tech, -data (too generic)`);
  lines.push(`- Not an existing well-known brand`);
  lines.push(``);
  lines.push(`## Inspiration (tone/style, not to copy)`);
  lines.push(`Stripe, Linear, Notion, Vanta, Asana, Ramp, Figma, Loom, Rippling`);
  lines.push(``);

  if (opts.extraContext) {
    lines.push(`## Additional Context`);
    lines.push(opts.extraContext);
    lines.push(``);
  }

  lines.push(`## Output Format`);
  lines.push(`For each name, provide:`);
  lines.push(`1. **Name** — the name itself`);
  lines.push(`2. **Meaning/Rationale** — 1-2 sentences on origin and what it evokes`);
  lines.push(`3. **Style** — which naming style it falls into`);
  lines.push(`4. **Score** — out of 10, with brief justification`);
  lines.push(`5. **Domain options** — 2-3 .com variations`);
  lines.push(`6. **Risk notes** — any potential concerns (trademark, generic, similar brands)`);
  lines.push(``);
  lines.push(`Present results sorted from highest to lowest score. Be direct — if a name is weak, say so.`);

  return lines.join('\n');
}

export default function PromptBuilderPage() {
  const [coreWords, setCoreWords] = useState(SEED_WORDS.slice(0, 15).join(', '));
  const [avoidWords, setAvoidWords] = useState('tech, data, ware, soft, digital, cloud, smart (overused), cyber, secure, safe (too IT)');
  const [style, setStyle] = useState<NamingStyle>('invented');
  const [length, setLength] = useState('5-7 characters');
  const [count, setCount] = useState(20);
  const [extraContext, setExtraContext] = useState('');
  const [copied, setCopied] = useState(false);

  const prompt = buildPrompt({ coreWords, avoidWords, style, length, count, extraContext });

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Prompt Builder</h1>
        <p className="text-sm text-slate-500 mt-1">
          Build a structured prompt to paste into ChatGPT or Claude for AI-powered name generation
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="space-y-5">

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Configuration</h2>

            {/* Naming style */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Naming Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as NamingStyle)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>{STYLE_LABELS[s]}</option>
                ))}
              </select>
            </div>

            {/* Desired length */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Desired Length</label>
              <div className="flex flex-wrap gap-2">
                {LENGTH_OPTIONS.map((l) => (
                  <button
                    key={l}
                    onClick={() => setLength(l)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      length === l
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Number of names */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Number of Names</label>
              <div className="flex gap-2">
                {COUNT_OPTIONS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      count === n
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-800">Words</h2>

            {/* Core words */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Core Theme Words
                <span className="text-slate-400 font-normal ml-1">(comma separated)</span>
              </label>
              <textarea
                value={coreWords}
                onChange={(e) => setCoreWords(e.target.value)}
                rows={3}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Sense, Signal, Pulse, Clarity…"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {SEED_WORDS.map((w) => (
                  <button
                    key={w}
                    onClick={() => {
                      const words = coreWords.split(',').map((s) => s.trim()).filter(Boolean);
                      if (!words.includes(w)) {
                        setCoreWords([...words, w].join(', '));
                      }
                    }}
                    className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
                  >
                    +{w}
                  </button>
                ))}
              </div>
            </div>

            {/* Avoid words */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Words / Patterns to Avoid</label>
              <textarea
                value={avoidWords}
                onChange={(e) => setAvoidWords(e.target.value)}
                rows={2}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="tech, data, cloud…"
              />
            </div>

            {/* Extra context */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Extra Context
                <span className="text-slate-400 font-normal ml-1">(optional)</span>
              </label>
              <textarea
                value={extraContext}
                onChange={(e) => setExtraContext(e.target.value)}
                rows={2}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="e.g. target market is SMBs, not enterprise. Should feel friendly but professional."
              />
            </div>
          </div>
        </div>

        {/* Right: Generated prompt */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-800">Generated Prompt</h2>
            <div className="flex gap-2">
              <a
                href="https://chatgpt.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-lg hover:bg-slate-50"
              >
                Open ChatGPT ↗
              </a>
              <button
                onClick={copyPrompt}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {copied ? 'Copied!' : 'Copy Prompt'}
              </button>
            </div>
          </div>

          <div className="flex-1 bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-700/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-600" />
                <div className="w-3 h-3 rounded-full bg-slate-600" />
                <div className="w-3 h-3 rounded-full bg-slate-600" />
              </div>
              <span className="text-xs text-slate-400">prompt.txt</span>
            </div>
            <pre className="p-5 text-xs text-slate-300 leading-relaxed overflow-auto h-[calc(100vh-380px)] min-h-64 whitespace-pre-wrap font-mono">
              {prompt}
            </pre>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Copy this prompt and paste it into ChatGPT, Claude, or any AI assistant. Then paste the results into the Generate page or add them manually to the database.
          </div>
        </div>
      </div>
    </div>
  );
}
