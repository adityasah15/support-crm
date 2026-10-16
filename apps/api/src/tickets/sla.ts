import { Priority, TicketStatus } from '@prisma/client';

// Read-time SLA, no cron. Tradeoff: no auto-escalation/notifications.
export const SLA_HOURS: Record<Priority, number> = {
  URGENT: 4,
  HIGH: 24,
  MEDIUM: 72,
  LOW: 120,
};

export function slaDueAt(createdAt: Date, priority: Priority): Date {
  return new Date(createdAt.getTime() + SLA_HOURS[priority] * 3600 * 1000);
}

export function isOverdue(
  createdAt: Date,
  priority: Priority,
  status: TicketStatus,
): boolean {
  if (status === TicketStatus.CLOSED) return false;
  return Date.now() > slaDueAt(createdAt, priority).getTime();
}

export function toDbPriority(input?: string): Priority | undefined {
  if (!input) return undefined;
  const v = input.trim().toUpperCase();
  if (v === 'LOW' || v === 'MEDIUM' || v === 'HIGH' || v === 'URGENT') {
    return v as Priority;
  }
  return undefined;
}
