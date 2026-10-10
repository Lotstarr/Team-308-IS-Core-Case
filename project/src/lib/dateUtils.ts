export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateStr === today;
}

export function isThisWeek(dateStr: string): boolean {
  const date = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const daysDiff = diff / (1000 * 60 * 60 * 24);
  return daysDiff >= 0 && daysDiff <= 7;
}

export function isPast(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateStr < today;
}

export function getDaysUntil(dateStr: string): number {
  const date = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diff = date.getTime() - now.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function getRelativeDateLabel(dateStr: string): string {
  const days = getDaysUntil(dateStr);
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days <= 7) return `In ${days} days`;
  return formatDateShort(dateStr);
}
