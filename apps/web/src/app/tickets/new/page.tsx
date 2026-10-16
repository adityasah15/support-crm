'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { createTicket } from '@/lib/api';

const schema = z.object({
  customer_name: z.string().min(1, 'Name required').max(120),
  customer_email: z.string().email('Valid email required').max(255),
  subject: z.string().min(1, 'Subject required').max(200),
  description: z.string().min(1, 'Description required').max(5000),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

type FormValues = z.infer<typeof schema>;

export default function NewTicketPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setBusy(true);
    try {
      const out = await createTicket(values);
      toast.success(`Created ${out.ticket_id}`);
      router.push(`/tickets/${out.ticket_id}`);
    } catch (e: any) {
      toast.error(e?.message ?? 'Create failed');
    } finally {
      setBusy(false);
    }
  }

  const input = 'w-full rounded border px-3 py-2';

  return (
    <div className="mx-auto max-w-xl rounded border bg-white p-6">
      <h1 className="text-lg font-semibold">New Ticket</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
        <div>
          <input {...register('customer_name')} placeholder="Customer name" className={input} />
          {errors.customer_name && (
            <p className="text-sm text-red-600">{errors.customer_name.message}</p>
          )}
        </div>
        <div>
          <input {...register('customer_email')} placeholder="Customer email" className={input} />
          {errors.customer_email && (
            <p className="text-sm text-red-600">{errors.customer_email.message}</p>
          )}
        </div>
        <div>
          <input {...register('subject')} placeholder="Issue title" className={input} />
          {errors.subject && (
            <p className="text-sm text-red-600">{errors.subject.message}</p>
          )}
        </div>
        <div>
          <textarea
            {...register('description')}
            placeholder="Description"
            rows={5}
            className={input}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>
        <div>
          <select {...register('priority')} className={input}>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
        </div>
        <button
          disabled={busy}
          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {busy ? 'Creating...' : 'Create ticket'}
        </button>
      </form>
    </div>
  );
}
