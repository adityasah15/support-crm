import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TicketsService } from './tickets.service';

function mockPrisma(overrides: Record<string, any> = {}) {
  return {
    $transaction: jest.fn((fn: any) =>
      fn({
        ticket: {
          create: jest.fn(),
          update: jest.fn(),
        },
        note: { create: jest.fn() },
      }),
    ),
    ticket: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    note: { create: jest.fn() },
    ...overrides,
  } as any;
}

describe('TicketsService', () => {
  it('creates ticket then assigns TKT-xxx from id', async () => {
    const txUpdate = jest.fn().mockResolvedValue({
      ticketId: 'TKT-007',
      createdAt: new Date(),
    });
    const prisma = mockPrisma({
      $transaction: jest.fn((fn: any) =>
        fn({
          ticket: {
            create: jest.fn().mockResolvedValue({ id: 7 }),
            update: txUpdate,
          },
        }),
      ),
    });
    const svc = new TicketsService(prisma);
    const out = await svc.create({
      customer_name: 'A',
      customer_email: 'a@example.com',
      subject: 'S',
      description: 'D',
    } as any);
    expect(txUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 7 },
        data: { ticketId: 'TKT-007' },
      }),
    );
    expect(out.ticket_id).toBe('TKT-007');
  });

  it('throws 404 for unknown ticket id', async () => {
    const prisma = mockPrisma({
      ticket: { findUnique: jest.fn().mockResolvedValue(null) },
    });
    const svc = new TicketsService(prisma);
    await expect(svc.findOne('TKT-999')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rejects invalid status on list', async () => {
    const prisma = mockPrisma();
    const svc = new TicketsService(prisma);
    await expect(svc.findAll({ status: 'Bogus' } as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
