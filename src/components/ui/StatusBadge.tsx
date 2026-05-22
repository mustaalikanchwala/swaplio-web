import type { MeetingStatus } from '@/types';
import clsx from 'clsx';

const STATUS_CONFIG: Record<MeetingStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25',
  },
  CONFIRMED: {
    label: 'Confirmed',
    className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  },
  RESCHEDULED: {
    label: 'Rescheduled',
    className: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-500/15 text-red-400 border border-red-500/25',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/25',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/25',
  },
};

interface StatusBadgeProps {
  status: MeetingStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, className: statusClass } = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'bg-zinc-500/15 text-zinc-400',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        statusClass,
        className
      )}
    >
      {label}
    </span>
  );
}
