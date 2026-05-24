import type { MeetingStatus } from '@/types';
import clsx from 'clsx';

const STATUS_CONFIG: Record<MeetingStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  },
  CONFIRMED: {
    label: 'Confirmed',
    className: 'bg-green-500/15 text-green-400 border border-green-500/20',
  },
  RESCHEDULED: {
    label: 'Rescheduled',
    className: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-500/15 text-red-400 border border-red-500/20',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-white/10 text-white/60 border border-white/10',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-white/10 text-white/40 border border-white/5',
  },
};

interface StatusBadgeProps {
  status: MeetingStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, className: statusClass } = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/20',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium font-sans',
        statusClass,
        className
      )}
    >
      {label}
    </span>
  );
}
