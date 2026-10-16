'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/StatusBadge';
import { fetchTicketDetail, updateTicket } from '@/lib/api';

const STATUSES = ['Open', 'In Progress', 'Closed'] as const;

export default function TicketDetailPage() {
  const params = useParams<{ ticketId: string }>();
  const ticketId = params.ticketId;
  const qc = useQueryClient();
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [note, setNote] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => fetchTicketDetail(ticketId),
  });

  const mut = useMutation({
    mutationFn: (input: { status?: string; notes?: string; priority?: string }) =>
      updateTicket(ticketId, input),
    onSuccess: () => {
      toast.success('Updated');
      setNote('');
      qc.invalidateQueries({ queryKey: ['ticket', ticketId] });
      qc.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (e: any) => toast.error(e?.message ?? 'Update failed'),
  });

  if (isLoading) return <div className="h-24 animate-pulse rounded bg-gray-200" />;
  if (isError || !data)
    return <p className="rounded border bg-white p-8 text-center">Ticket not found.</p>;

  const nextStatus = status || data.status;
  const nextPriority = priority || data.priority;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded border bg-white p-5 md:col-span-2">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold">{data.ticket_id}</h1>
          <StatusBadge status={data.status} />
          <span className="text-xs">{data.priority}</span>
          {data.overdue && (
            <span className="rounded bg-red-600 px-2 py-0.5 text-xs text-white">
              Overdue · due {new Date(data.sla_due_at).toLocaleString()}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {data.customer_name} · {data.customer_email} ·{' '}
          {new Date(data.created_at).toLocaleString()}
        </p>
        <h2 className="mt-4 font-medium">{data.subject}</h2>
        <p className="mt-1 whitespace-pre-wrap text-sm">{data.description}</p>

        <div className="mt-5 flex flex-col gap-2 md:flex-row">
          <select
            value={nextStatus}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={nextPriority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded border px-3 py-2 text-sm"
          >
            {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <button
            disabled={mut.isPending}
            onClick={() =>
              mut.mutate({ status: nextStatus, priority: nextPriority })
            }
            className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Update
          </button>
        </div>
      </div>

      <div className="rounded border bg-white p-5">
        <h3 className="font-medium">Notes</h3>
        <div className="mt-3 space-y-2">
          {data.notes.length === 0 ? (
            <p className="text-sm text-gray-500">No notes yet.</p>
          ) : (
            data.notes.map((n) => (
              <div key={n.id} className="rounded bg-gray-50 p-2 text-sm">
                <p>{n.note_text}</p>
                <p className="text-xs text-gray-500">
                  {new Date(n.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Add a note..."
          className="mt-3 w-full rounded border px-3 py-2 text-sm"
        />
        <button
          disabled={mut.isPending || !note.trim()}
          onClick={() => mut.mutate({ notes: note.trim() })}
          className="mt-2 rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50"
        >
          Add note
        </button>
      </div>
    </div>
  );
}
