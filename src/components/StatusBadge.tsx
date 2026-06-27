import type { NameStatus, DomainStatus } from '@/types';

const STATUS_STYLES: Record<string, string> = {
  New: 'bg-slate-100 text-slate-700',
  Like: 'bg-blue-100 text-blue-700',
  Maybe: 'bg-amber-100 text-amber-700',
  Reject: 'bg-red-100 text-red-700',
  Shortlist: 'bg-emerald-100 text-emerald-700',
  'Domain Taken': 'bg-red-100 text-red-800',
  'Trademark Concern': 'bg-orange-100 text-orange-700',
  Unknown: 'bg-slate-100 text-slate-500',
  Available: 'bg-green-100 text-green-700',
  Taken: 'bg-red-100 text-red-700',
  Premium: 'bg-purple-100 text-purple-700',
  'Needs Check': 'bg-yellow-100 text-yellow-700',
};

interface Props {
  status: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'sm' }: Props) {
  const style = STATUS_STYLES[status] || 'bg-slate-100 text-slate-600';
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1';
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${style}`}>
      {status}
    </span>
  );
}
