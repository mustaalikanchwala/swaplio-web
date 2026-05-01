import { type ClassValue, clsx } from 'clsx';

// Simple cn utility (without clsx dep, manual merge)
export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]): string {
  return inputs
    .filter(Boolean)
    .map((v) => {
      if (typeof v === 'string') return v;
      if (typeof v === 'object' && v !== null) {
        return Object.entries(v)
          .filter(([, val]) => Boolean(val))
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .join(' ')
    .trim();
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr));
}

export function formatDateTime(dateStr: string, timeStr?: string): string {
  if (timeStr) {
    return `${formatDate(dateStr)} at ${timeStr}`;
  }
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

export function getConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    NEW: 'New',
    LIKE_NEW: 'Like New',
    GOOD: 'Good',
    FAIR: 'Fair',
    POOR: 'Poor',
  };
  return labels[condition] ?? condition;
}

export function getConditionColor(condition: string): string {
  const colors: Record<string, string> = {
    NEW:      'bg-emerald-900/40 text-emerald-300 border-emerald-700/30',
    LIKE_NEW: 'bg-teal-900/40 text-teal-300 border-teal-700/30',
    GOOD:     'bg-blue-900/40 text-blue-300 border-blue-700/30',
    FAIR:     'bg-amber-900/40 text-amber-300 border-amber-700/30',
    POOR:     'bg-red-900/40 text-red-300 border-red-700/30',
  };
  return colors[condition] ?? 'bg-secondary text-muted border-accent/15';
}

export function getMeetingStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING:   'bg-amber-900/40 text-amber-300 border-amber-700/30',
    CONFIRMED: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/30',
    CANCELLED: 'bg-red-900/50 text-red-300 border-red-700/30',
    COMPLETED: 'bg-blue-900/40 text-blue-300 border-blue-700/30',
  };
  return colors[status] ?? 'bg-secondary text-muted border-accent/15';
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}
