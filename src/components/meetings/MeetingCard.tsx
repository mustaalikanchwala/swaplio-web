'use client';

import Link from 'next/link';
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Meeting } from '@/types';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface MeetingCardProps {
  meeting: Meeting;
  role: 'buyer' | 'seller';
  className?: string;
  style?: React.CSSProperties;
}

function formatDateTime(date: string, time: string) {
  const [h, m] = time.split(':');
  const d = new Date(date);
  return {
    date: d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
    time: `${h}:${m}`,
  };
}

const MotionLink = motion(Link);

export function MeetingCard({ meeting, role, className, style }: MeetingCardProps) {
  const { date, time } = formatDateTime(meeting.meetingDate, meeting.meetingTime);
  const otherParty = role === 'buyer' ? meeting.sellerName : meeting.buyerName;

  return (
    <MotionLink
      href={`/meetings/${meeting.id}`}
      whileHover={{ scale: 1.01 }}
      className={clsx('block group', className)}
      style={style}
    >
      <div className="glass p-4 flex items-center gap-4 border border-bg-border bg-bg-surface hover:border-accent/30 hover:shadow-glow-sm transition-all duration-200">
        {/* Date blob */}
        <div className="shrink-0 w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 flex flex-col items-center justify-center">
          <span className="text-[10px] text-accent uppercase font-semibold">
            {new Date(meeting.meetingDate).toLocaleDateString('en-IN', { month: 'short' })}
          </span>
          <span className="text-lg font-bold text-white leading-none">
            {new Date(meeting.meetingDate).getDate()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 font-sans">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm text-white truncate">
              {meeting.listingTitle}
            </p>
            <StatusBadge status={meeting.status} />
          </div>
          <p className="text-xs text-text-muted mb-1.5">
            {role === 'buyer' ? 'Seller' : 'Buyer'}: {otherParty}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-text-secondary">
            <span className="flex items-center gap-1">
              <Clock size={11} className="text-text-muted" /> {time}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={11} className="text-text-muted" /> {meeting.location}
            </span>
          </div>
        </div>

        <ChevronRight size={16} className="shrink-0 text-text-muted group-hover:text-accent transition-colors" />
      </div>
    </MotionLink>
  );
}
