export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type TicketListItem = {
  ticket_id: string;
  customer_name: string;
  subject: string;
  status: 'Open' | 'In Progress' | 'Closed';
  priority?: Priority;
  sla_due_at?: string;
  overdue?: boolean;
  created_at: string;
};

export type TicketDetail = {
  ticket_id: string;
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  status: TicketListItem['status'];
  priority: Priority;
  sla_due_at: string;
  overdue: boolean;
  created_at: string;
  updated_at: string;
  notes: { id: number; note_text: string; created_at: string }[];
};

const BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export async function fetchTickets(params: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<TicketListItem[]> {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.status && params.status !== 'All') qs.set('status', params.status);
  qs.set('page', String(params.page ?? 1));
  qs.set('limit', String(params.limit ?? 20));
  const res = await fetch(`${BASE}/tickets?${qs.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`List failed: ${res.status}`);
  return res.json();
}

export async function fetchTicketDetail(ticketId: string): Promise<TicketDetail> {
  const res = await fetch(`${BASE}/tickets/${ticketId}`, { cache: 'no-store' });
  if (res.status === 404) throw new Error('Ticket not found');
  if (!res.ok) throw new Error(`Detail failed: ${res.status}`);
  return res.json();
}

export async function createTicket(input: {
  customer_name: string;
  customer_email: string;
  subject: string;
  description: string;
  priority?: string;
}): Promise<{ ticket_id: string; created_at: string }> {
  const res = await fetch(`${BASE}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      Array.isArray(body?.message) ? body.message.join(', ') : 'Create failed',
    );
  }
  return res.json();
}

export async function updateTicket(
  ticketId: string,
  input: { status?: string; notes?: string; priority?: string },
): Promise<{ success: boolean; updated_at: string }> {
  const res = await fetch(`${BASE}/tickets/${ticketId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(
      Array.isArray(body?.message) ? body.message.join(', ') : 'Update failed',
    );
  }
  return res.json();
}
