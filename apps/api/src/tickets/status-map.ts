import { TicketStatus } from '@prisma/client';
import { ApiStatus } from './dto/update-ticket.dto';

export function toDbStatus(input?: string): TicketStatus | undefined {
  if (!input) return undefined;
  const v = input.trim().toLowerCase().replace(/_/g, ' ');
  if (v === 'open') return TicketStatus.OPEN;
  if (v === 'in progress' || v === 'inprogress' || v === 'in-progress') {
    return TicketStatus.IN_PROGRESS;
  }
  if (v === 'closed') return TicketStatus.CLOSED;
  return undefined;
}

export function toApiStatus(db: TicketStatus): ApiStatus {
  if (db === TicketStatus.IN_PROGRESS) return 'In Progress';
  if (db === TicketStatus.CLOSED) return 'Closed';
  return 'Open';
}
