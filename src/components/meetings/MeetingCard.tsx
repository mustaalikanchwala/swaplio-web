'use client';

import Link from 'next/link';
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Meeting } from '@/types';
import clsx from 'clsx';

interface MeetingCardProps {
  meeting: Meeting;
  role: 'buyer' | 'seller';
  className?: string;
}

function formatDateTime(date: string, time: string) {
  const [h, m] = time.split(':');
  const d = new Date(date);
  return {
    date: d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
    time: `${h}:${m}`,
  };
}

export function MeetingCard({ meeting, role, className }: MeetingCardProps) {
  const { date, time } = formatDateTime(meeting.meetingDate, meeting.meetingTime);
  const otherParty = role === 'buyer' ? meeting.sellerName : meeting.buyerName;

  return (
    <Link href={`/meetings/${meeting.id}`} className={clsx('block group', className)}>
      <div className="glass glass-hover p-4 flex items-center gap-4">
        {/* Date blob */}
        <div className="shrink-0 w-14 h-14 rounded-xl bg-violet-500/10 border border-violet-500/20 flex flex-col items-center justify-center">
          <span className="text-[10px] text-violet-400 uppercase font-semibold">
            {new Date(meeting.meetingDate).toLocaleDateString('en-IN', { month: 'short' })}
          </span>
          <span className="text-lg font-bold text-[var(--text-primary)] leading-none">
            {new Date(meeting.meetingDate).getDate()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm text-[var(--text-primary)] truncate">
              {meeting.listingTitle}
            </p>
            <StatusBadge status={meeting.status} />
          </div>
          <p className="text-xs text-[var(--text-muted)] mb-1.5">
            {role === 'buyer' ? 'Seller' : 'Buyer'}: {otherParty}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
            <span className="flex items-center gap-1">
              <Clock size={11} /> {time}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={11} /> {meeting.location}
            </span>
          </div>
        </div>

        <ChevronRight size={16} className="shrink-0 text-[var(--text-muted)] group-hover:text-violet-400 transition-colors" />
      </div>
    </Link>
  );
}
