export const IN_LOCALE = 'en-IN';
export const IN_TIME_ZONE = 'Asia/Kolkata';

export function formatDateIN(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  return d.toLocaleDateString(IN_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: IN_TIME_ZONE,
  });
}

export function formatDateTimeIN(input: string | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  return d.toLocaleString(IN_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: IN_TIME_ZONE,
  });
}
