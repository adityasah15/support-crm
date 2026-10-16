import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { QueryTicketsDto } from './dto/query-tickets.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { toApiStatus, toDbStatus } from './status-map';
import { isOverdue, slaDueAt, toDbPriority } from './sla';

function ticketIdOf(id: number): string {
  return 'TKT-' + String(id).padStart(3, '0');
}

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTicketDto) {
    const dbPriority = toDbPriority(dto.priority) ?? 'MEDIUM';
    // Avoid count+1 race: insert, then derive TKT-xxx from autoincrement id.
    const created = await this.prisma.$transaction(async (tx) => {
      const row = await tx.ticket.create({
        data: {
          customerName: dto.customer_name,
          customerEmail: dto.customer_email,
          subject: dto.subject,
          description: dto.description,
          priority: dbPriority as any,
        },
      });
      return tx.ticket.update({
        where: { id: row.id },
        data: { ticketId: ticketIdOf(row.id) },
      });
    });
    return { ticket_id: created.ticketId, created_at: created.createdAt };
  }

  async findAll(query: QueryTicketsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const dbStatus = toDbStatus(query.status);
    if (query.status && !dbStatus) {
      throw new BadRequestException('Invalid status. Use Open, In Progress, Closed.');
    }
    const dbPriority = toDbPriority(query.priority);
    if (query.priority && !dbPriority) {
      throw new BadRequestException('Invalid priority. Use LOW, MEDIUM, HIGH, URGENT.');
    }
    const search = query.search?.trim();

    const where: Prisma.TicketWhereInput = {
      ...(dbStatus && { status: dbStatus }),
      ...(dbPriority && { priority: dbPriority as any }),
      ...(search && {
        OR: [
          { ticketId: { contains: search, mode: 'insensitive' } },
          { customerName: { contains: search, mode: 'insensitive' } },
          { customerEmail: { contains: search, mode: 'insensitive' } },
          { subject: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const rows = await this.prisma.ticket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return rows.map((t) => ({
      ticket_id: t.ticketId,
      customer_name: t.customerName,
      subject: t.subject,
      status: toApiStatus(t.status),
      priority: (t as any).priority ?? 'MEDIUM',
      sla_due_at: slaDueAt(t.createdAt, (t as any).priority ?? 'MEDIUM'),
      overdue: isOverdue(t.createdAt, (t as any).priority ?? 'MEDIUM', t.status),
      created_at: t.createdAt,
    }));
  }

  async findOne(ticketId: string) {
    const t = await this.prisma.ticket.findUnique({
      where: { ticketId },
      include: { notes: { orderBy: { createdAt: 'asc' } } },
    });
    if (!t) throw new NotFoundException(`Ticket ${ticketId} not found`);
    const priority = (t as any).priority ?? 'MEDIUM';
    return {
      ticket_id: t.ticketId,
      customer_name: t.customerName,
      customer_email: t.customerEmail,
      subject: t.subject,
      description: t.description,
      status: toApiStatus(t.status),
      priority,
      sla_due_at: slaDueAt(t.createdAt, priority),
      overdue: isOverdue(t.createdAt, priority, t.status),
      created_at: t.createdAt,
      updated_at: t.updatedAt,
      notes: t.notes.map((n) => ({
        id: n.id,
        note_text: n.noteText,
        created_at: n.createdAt,
      })),
    };
  }

  async update(ticketId: string, dto: UpdateTicketDto) {
    const existing = await this.prisma.ticket.findUnique({
      where: { ticketId },
    });
    if (!existing) throw new NotFoundException(`Ticket ${ticketId} not found`);
    if (!dto.status && !dto.notes && !dto.priority) {
      throw new BadRequestException('Provide status, priority and/or notes to update.');
    }

    let dbStatus;
    if (dto.status) {
      dbStatus = toDbStatus(dto.status);
      if (!dbStatus) {
        throw new BadRequestException('Invalid status. Use Open, In Progress, Closed.');
      }
    }
    let dbPriority;
    if (dto.priority) {
      dbPriority = toDbPriority(dto.priority);
      if (!dbPriority) {
        throw new BadRequestException('Invalid priority. Use LOW, MEDIUM, HIGH, URGENT.');
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.notes) {
        await tx.note.create({
          data: { ticketRef: existing.id, noteText: dto.notes },
        });
      }
      // Touch updatedAt even for note-only updates.
      return tx.ticket.update({
        where: { id: existing.id },
        data: {
          ...(dbStatus && { status: dbStatus }),
          ...(dbPriority && { priority: dbPriority as any }),
          updatedAt: new Date(),
        },
      });
    });

    return { success: true, updated_at: updated.updatedAt };
  }
}
