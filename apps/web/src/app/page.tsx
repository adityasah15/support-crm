'use client';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PriorityBadge } from '@/components/PriorityBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { useDebounce } from '@/hooks/useDebounce';
import { fetchTickets } from '@/lib/api';
import { formatDateIN } from '@/lib/format';

const FILTERS = ['All', 'Open', 'In Progress', 'Closed'] as const;
const PAGE_SIZE = 20;
const WEIGHT: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<(typeof FILTERS)[number]>('All');
  const [page, setPage] = useState(1);
  const [sortUrgent, setSortUrgent] = useState(false);
  const debounced = useDebounce(search, 300);

  const queryKey = useMemo(
    () => ['tickets', debounced, status, page],
    [debounced, status, page],
  );

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () =>
      fetchTickets({
        search: debounced || undefined,
        status,
        page,
        limit: PAGE_SIZE,
      }),
  });

  useEffect(() => {
    if (isError) toast.error('Failed to load tickets');
  }, [isError]);

  const rows = useMemo(() => {
    if (!data) return data;
    if (!sortUrgent) return data;
    return [...data].sort(
      (a, b) =>
        (WEIGHT[a.priority ?? 'MEDIUM'] ?? 2) -
          (WEIGHT[b.priority ?? 'MEDIUM'] ?? 2) ||
        Number(b.overdue ?? false) - Number(a.overdue ?? false),
    );
  }, [data, sortUrgent]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search name, ID, email, subject, description..."
          aria-label="Search tickets"
          className="w-full rounded border px-3 py-2 md:max-w-md"
        />
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => {
                setStatus(f);
                setPage(1);
              }}
              className={`rounded-full px-3 py-1 text-sm ${
                status === f ? 'bg-black text-white' : 'bg-white border'
              }`}
            >
              {f}
            </button>
          ))}
          <button
            onClick={() => setSortUrgent((v) => !v)}
            className={`rounded-full px-3 py-1 text-sm ${
              sortUrgent ? 'bg-red-600 text-white' : 'bg-white border'
            }`}
            title="Sort by urgency (read-time SLA)"
          >
            Urgent first
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <p className="text-sm text-gray-500">
            Loading tickets… first load may take ~50s while the Render
            free-tier API wakes up.
          </p>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded bg-gray-200" />
          ))}
        </div>
      ) : !rows || rows.length === 0 ? (
        <p className="rounded border bg-white p-8 text-center text-gray-500">
          No tickets found. Adjust search or filter.
        </p>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded border bg-white md:block">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Priority</th>
                  <th className="px-3 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.ticket_id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <Link
                        href={`/tickets/${t.ticket_id}`}
                        className="font-medium underline"
                      >
                        {t.ticket_id}
                      </Link>
                      {t.overdue && (
                        <span className="ml-2 rounded bg-red-600 px-1.5 py-0.5 text-[11px] text-white">
                          Overdue
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">{t.customer_name}</td>
                    <td className="px-3 py-2">{t.subject}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-3 py-2">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="px-3 py-2">{formatDateIN(t.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2 md:hidden">
            {rows.map((t) => (
              <Link
                key={t.ticket_id}
                href={`/tickets/${t.ticket_id}`}
                className="block rounded border bg-white p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t.ticket_id}</span>
                  <StatusBadge status={t.status} />
                </div>
                <p className="mt-1 text-sm">{t.subject}</p>
                <p className="text-xs text-gray-500">
                  {t.customer_name} · {t.priority} · {formatDateIN(t.created_at)}{' '}
                  {t.overdue && <span className="text-red-600">· Overdue</span>}
                </p>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border bg-white px-3 py-1 text-sm disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm">Page {page}</span>
            <button
              disabled={rows.length < PAGE_SIZE}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border bg-white px-3 py-1 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}
