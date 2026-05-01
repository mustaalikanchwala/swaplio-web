import React from 'react';
import { cn, getConditionColor, getConditionLabel, getMeetingStatusColor } from '@/utils';
import type { Condition, MeetingStatus, ListingStatus } from '@/types';

interface BadgeProps {
  label: string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ label, className }) => (
  <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border', className)}>
    {label}
  </span>
);

export const ConditionBadge: React.FC<{ condition: Condition }> = ({ condition }) => (
  <Badge label={getConditionLabel(condition)} className={cn('border', getConditionColor(condition))} />
);

export const MeetingStatusBadge: React.FC<{ status: MeetingStatus }> = ({ status }) => (
  <Badge label={status} className={cn('border', getMeetingStatusColor(status))} />
);

export const ListingStatusBadge: React.FC<{ status: ListingStatus }> = ({ status }) => {
  const colors: Record<ListingStatus, string> = {
    ACTIVE:  'bg-success/10 text-success border-success/30',
    SOLD:    'bg-danger/10 text-danger border-danger/30',
    EXPIRED: 'bg-secondary/80 text-white/40 border-white/10',
  };
  return <Badge label={status} className={cn('border', colors[status])} />;
};
