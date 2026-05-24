import type { Condition } from '@/types';
import clsx from 'clsx';

const CONDITION_CONFIG: Record<
  Condition,
  { label: string; className: string }
> = {
  NEW: {
    label: 'Brand New',
    className: 'bg-green-500/15 text-green-400 border border-green-500/20',
  },
  LIKE_NEW: {
    label: 'Like New',
    className: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
  },
  GOOD: {
    label: 'Good',
    className: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
  },
  FAIR: {
    label: 'Fair',
    className: 'bg-red-500/15 text-red-400 border border-red-500/20',
  },
};

interface ConditionBadgeProps {
  condition: Condition;
  className?: string;
}

export function ConditionBadge({ condition, className }: ConditionBadgeProps) {
  const { label, className: condClass } = CONDITION_CONFIG[condition] ?? {
    label: condition,
    className: 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/20',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium font-sans',
        condClass,
        className
      )}
    >
      {label}
    </span>
  );
}
