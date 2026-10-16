const COLORS: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-800',
  HIGH: 'bg-orange-100 text-orange-800',
  MEDIUM: 'bg-slate-100 text-slate-700',
  LOW: 'bg-gray-100 text-gray-600',
};

export function PriorityBadge({ priority }: { priority?: string }) {
  const p = priority ?? 'MEDIUM';
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        COLORS[p] ?? 'bg-gray-100 text-gray-800'
      }`}
    >
      {p}
    </span>
  );
}
