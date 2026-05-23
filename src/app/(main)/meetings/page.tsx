'use client';

import * as Tabs from '@radix-ui/react-tabs';
import { useState } from 'react';
import { Loader2, Calendar } from 'lucide-react';
import clsx from 'clsx';
import { useBuyerMeetings, useSellerMeetings } from '@/hooks/useMeetings';
import { MeetingCard } from '@/components/meetings/MeetingCard';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import type { MeetingStatus } from '@/types';

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'RESCHEDULED', label: 'Rescheduled' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

function MeetingList({ role }: { role: 'buyer' | 'seller' }) {
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filters = {
    status: status || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  const buyerQuery = useBuyerMeetings(role === 'buyer' ? filters : undefined);
  const sellerQuery = useSellerMeetings(role === 'seller' ? filters : undefined);

  const query = role === 'buyer' ? buyerQuery : sellerQuery;
  const meetings = query.data ?? [];

  return (
    <div>
      {/* Filters bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Status chips */}
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setStatus(value)}
              className={clsx(
                'px-3 py-1 rounded-full text-xs font-medium border transition-all',
                status === value
                  ? 'border-violet-500/60 bg-violet-500/15 text-violet-300'
                  : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-violet-500/40'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input w-36 text-xs py-1.5"
            style={{ colorScheme: 'dark' }}
          />
          <span className="text-[var(--text-muted)] text-xs">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input w-36 text-xs py-1.5"
            style={{ colorScheme: 'dark' }}
          />
        </div>
      </div>

      {/* List */}
      {query.isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-violet-400" />
        </div>
      ) : meetings.length === 0 ? (
        <div className="glass p-12 text-center">
          <Calendar size={40} className="text-[var(--text-muted)] opacity-30 mx-auto mb-3" />
          <p className="text-[var(--text-muted)]">No meetings found</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} role={role} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MeetingsPage() {
  return (
    <ProtectedRoute>
      <div className="page-wrapper max-w-3xl">
        <h1 className="text-2xl font-bold gradient-text mb-6">Meetings</h1>

        <Tabs.Root defaultValue="buying">
          <Tabs.List className="flex gap-1 glass p-1 rounded-xl mb-6 w-fit">
            {[
              { value: 'buying', label: 'Buying' },
              { value: 'selling', label: 'Selling' },
            ].map(({ value, label }) => (
              <Tabs.Trigger
                key={value}
                value={value}
                className={clsx(
                  'px-5 py-2 rounded-lg text-sm font-medium transition-all',
                  'data-[state=active]:bg-violet-500/20 data-[state=active]:text-violet-300',
                  'data-[state=inactive]:text-[var(--text-muted)] data-[state=inactive]:hover:text-[var(--text-primary)]'
                )}
              >
                {label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="buying">
            <MeetingList role="buyer" />
          </Tabs.Content>
          <Tabs.Content value="selling">
            <MeetingList role="seller" />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </ProtectedRoute>
  );
}
