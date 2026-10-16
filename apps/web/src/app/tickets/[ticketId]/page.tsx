'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/StatusBadge';
import { PriorityBadge } from '@/components/PriorityBadge';
import { fetchTicketDetail, updateTicket } from '@/lib/api';
import { formatDateTimeIN } from '@/lib/format';

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
      setStatus('');
      setPriority('');
      qc.invalidateQueries({ queryKey: ['ticket', ticketId] });
      qc.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (e: any) => toast.error(e?.message ?? 'Update failed'),
  });

  if (isLoading)
    return (
      <div className="space-y-2">
        <p className="text-sm text-gray-500">
          Loading ticket… first load may take ~50s while the Render
          free-tier API wakes up.
        </p>
        <div className="h-24 animate-pulse rounded bg-gray-200" />
      </div>
    );
  if (isError || !data)
    return <p className="rounded border bg-white p-8 text-center">Ticket not found.</p>;

  const nextStatus = status || data.status;
  const nextPriority = priority || data.priority;
  const isDirty =
    nextStatus !== data.status || nextPriority !== data.priority;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded border bg-white p-5 md:col-span-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold">{data.ticket_id}</h1>
          <StatusBadge status={data.status} />
          <PriorityBadge priority={data.priority} />
          {data.overdue && (
            <span className="rounded bg-red-600 px-2 py-0.5 text-xs text-white">
              Overdue · due {formatDateTimeIN(data.sla_due_at)}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {data.customer_name} · {data.customer_email} ·{' '}
          {formatDateTimeIN(data.created_at)}
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
            disabled={mut.isPending || !isDirty}
            onClick={() => {
              const payload: { status?: string; priority?: string } = {};
              if (nextStatus !== data.status) payload.status = nextStatus;
              if (nextPriority !== data.priority)
                payload.priority = nextPriority;
              mut.mutate(payload);
            }}
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
                  {formatDateTimeIN(n.created_at)}
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
