import { PrismaClient, TicketStatus } from '@prisma/client';

const prisma = new PrismaClient();

type SeedTicket = {
  ticketId: string;
  customerName: string;
  customerEmail: string;
  subject: string;
  description: string;
  status: TicketStatus;
  notes: string[];
  daysAgo: number;
};

const tickets: SeedTicket[] = [
  {
    ticketId: 'TKT-001',
    customerName: 'Aarav Mehta',
    customerEmail: 'aarav.mehta@example.com',
    subject: 'Login OTP not received',
    description: 'Customer is not receiving OTP on registered mobile during login. Tried resend twice.',
    status: 'OPEN',
    notes: ['Verified phone number, carrier delay suspected.'],
    daysAgo: 0,
  },
  {
    ticketId: 'TKT-002',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@example.com',
    subject: 'Refund not credited for order #4821',
    description: 'Refund initiated 5 days ago for cancelled order, amount not reflected in bank statement.',
    status: 'IN_PROGRESS',
    notes: ['Checked payment gateway, refund in processing state.', 'Asked customer for bank reference.'],
    daysAgo: 1,
  },
  {
    ticketId: 'TKT-003',
    customerName: 'Rohan Verma',
    customerEmail: 'rohan.v@example.com',
    subject: 'Dashboard charts not loading',
    description: 'Analytics dashboard shows blank charts on Chrome. Console shows 500 from /api/stats.',
    status: 'OPEN',
    notes: [],
    daysAgo: 1,
  },
  {
    ticketId: 'TKT-004',
    customerName: 'Sneha Iyer',
    customerEmail: 'sneha.iyer@example.com',
    subject: 'Unable to update billing address',
    description: 'Save button spins forever when updating billing address in account settings.',
    status: 'IN_PROGRESS',
    notes: ['Reproduced on staging.'],
    daysAgo: 2,
  },
  {
    ticketId: 'TKT-005',
    customerName: 'Kabir Singh',
    customerEmail: 'kabir.s@example.com',
    subject: 'App crashes on invoice download',
    description: 'Android app v2.4 crashes when downloading invoice PDF.',
    status: 'OPEN',
    notes: [],
    daysAgo: 2,
  },
  {
    ticketId: 'TKT-006',
    customerName: 'Ananya Das',
    customerEmail: 'ananya.das@example.com',
    subject: 'Password reset link expired',
    description: 'Reset link expires immediately after generation. Customer tried 3 times.',
    status: 'CLOSED',
    notes: ['Fixed token TTL config.', 'Confirmed customer can login now.'],
    daysAgo: 3,
  },
  {
    ticketId: 'TKT-007',
    customerName: 'Vikram Rao',
    customerEmail: 'vikram.rao@example.com',
    subject: 'Duplicate charge on credit card',
    description: 'Customer charged twice for same subscription renewal on 12 Oct.',
    status: 'IN_PROGRESS',
    notes: ['Escalated to billing team with transaction IDs.'],
    daysAgo: 3,
  },
  {
    ticketId: 'TKT-008',
    customerName: 'Neha Kapoor',
    customerEmail: 'neha.k@example.com',
    subject: 'Export CSV missing columns',
    description: 'Ticket export CSV is missing status and date columns compared to UI.',
    status: 'OPEN',
    notes: [],
    daysAgo: 4,
  },
  {
    ticketId: 'TKT-009',
    customerName: 'Arjun Nair',
    customerEmail: 'arjun.nair@example.com',
    subject: 'SSO login fails for team domain',
    description: 'Google SSO fails for @clientco.com with 403 after OAuth callback.',
    status: 'CLOSED',
    notes: ['Allowed domain was missing in OAuth config.', 'Verified with customer.'],
    daysAgo: 5,
  },
  {
    ticketId: 'TKT-010',
    customerName: 'Divya Menon',
    customerEmail: 'divya.menon@example.com',
    subject: 'Notification emails going to spam',
    description: 'All support reply emails land in spam for this customer domain.',
    status: 'OPEN',
    notes: ['SPF/DKIM check requested.'],
    daysAgo: 5,
  },
  {
    ticketId: 'TKT-011',
    customerName: 'Aditya Kulkarni',
    customerEmail: 'aditya.k@example.com',
    subject: 'Slow search on tickets page',
    description: 'Search takes 8+ seconds with 10k tickets. Needs index or debounce check.',
    status: 'IN_PROGRESS',
    notes: ['Added DB index on subject in staging for testing.'],
    daysAgo: 6,
  },
  {
    ticketId: 'TKT-012',
    customerName: 'Kavya Reddy',
    customerEmail: 'kavya.reddy@example.com',
    subject: 'Wrong plan shown after upgrade',
    description: 'Customer upgraded to Pro but UI still shows Free plan after payment success.',
    status: 'CLOSED',
    notes: ['Webhook delay, backfilled via Stripe event replay.'],
    daysAgo: 7,
  },
  {
    ticketId: 'TKT-013',
    customerName: 'Ishaan Patel',
    customerEmail: 'ishaan.p@example.com',
    subject: 'Cannot invite team member',
    description: 'Invite email never arrives for new team member, no error shown.',
    status: 'OPEN',
    notes: [],
    daysAgo: 7,
  },
  {
    ticketId: 'TKT-014',
    customerName: 'Meera Joshi',
    customerEmail: 'meera.joshi@example.com',
    subject: 'Order #9931 marked delivered but not received',
    description: 'Courier tracking shows delivered, customer says package not received.',
    status: 'IN_PROGRESS',
    notes: ['Raised with logistics partner, AWB shared.'],
    daysAgo: 8,
  },
  {
    ticketId: 'TKT-015',
    customerName: 'Rahul Gupta',
    customerEmail: 'rahul.gupta@example.com',
    subject: 'Feature request: bulk ticket assign',
    description: 'Support lead wants bulk assign for 50+ tickets during morning triage.',
    status: 'OPEN',
    notes: ['Logged as enhancement, workaround shared.'],
    daysAgo: 9,
  },
];

async function main() {
  for (const t of tickets) {
    const createdAt = new Date(Date.now() - t.daysAgo * 24 * 60 * 60 * 1000);
    await prisma.ticket.upsert({
      where: { ticketId: t.ticketId },
      update: {},
      create: {
        ticketId: t.ticketId,
        customerName: t.customerName,
        customerEmail: t.customerEmail,
        subject: t.subject,
        description: t.description,
        status: t.status,
        createdAt,
        updatedAt: createdAt,
        notes: {
          create: t.notes.map((noteText) => ({ noteText })),
        },
      },
    });
  }
  console.log(`Seeded ${tickets.length} tickets`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
