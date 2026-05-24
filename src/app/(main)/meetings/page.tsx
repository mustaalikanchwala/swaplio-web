'use client';

import * as Tabs from '@radix-ui/react-tabs';
import { useState } from 'react';
import { Loader2, Calendar, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import { useBuyerMeetings, useSellerMeetings } from '@/hooks/useMeetings';
import { MeetingCard } from '@/components/meetings/MeetingCard';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { motion } from 'framer-motion';
import Link from 'next/link';

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
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Status chips */}
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(({ value, label }) => (
            <motion.button
              key={value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStatus(value)}
              className={clsx(
                'px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200',
                status === value
                  ? 'border-accent/40 bg-accent/20 text-white'
                  : 'border-bg-border bg-bg-elevated text-text-secondary hover:border-white/20 hover:text-white'
              )}
            >
              {label}
            </motion.button>
          ))}
        </div>

        {/* Date range */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="input w-36 text-xs py-1.5 rounded-full"
            style={{ colorScheme: 'dark' }}
          />
          <span className="text-text-muted text-xs font-sans">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="input w-36 text-xs py-1.5 rounded-full"
            style={{ colorScheme: 'dark' }}
          />
        </div>
      </div>

      {/* List */}
      {query.isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={28} className="animate-spin text-accent" />
        </div>
      ) : meetings.length === 0 ? (
        <div className="glass p-12 text-center flex flex-col items-center justify-center gap-4">
          <Calendar size={48} className="text-text-muted opacity-30 mx-auto" />
          <h2 className="text-2xl font-serif text-white">No meetings scheduled</h2>
          <p className="text-text-secondary text-sm max-w-sm">You don&apos;t have any meeting requests yet. Go ahead and find something to buy or list something for sale.</p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="/listings" className="btn-primary">
              <span>Browse Listings</span>
              <span className="btn-primary-circle">
                <ArrowRight size={16} />
              </span>
            </Link>
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {meetings.map((meeting, index) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              role={role}
              style={{ animationDelay: `${index * 0.05}s` }}
              className="fade-in-up"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function MeetingsPage() {
  return (
    <ProtectedRoute>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="page-wrapper max-w-3xl font-sans"
      >
        <h1 className="text-3xl font-bold font-serif text-white mb-6">Meetings</h1>

        <Tabs.Root defaultValue="buying">
          <Tabs.List className="flex gap-1 bg-bg-elevated border border-bg-border p-1 rounded-full mb-6 w-fit shadow-inner">
            {[
              { value: 'buying', label: 'Buying' },
              { value: 'selling', label: 'Selling' },
            ].map(({ value, label }) => (
              <Tabs.Trigger
                key={value}
                value={value}
                className={clsx(
                  'px-6 py-2 rounded-full text-sm font-semibold transition-all duration-250',
                  'data-[state=active]:bg-accent data-[state=active]:text-white data-[state=active]:shadow-glow-sm',
                  'data-[state=inactive]:text-text-secondary data-[state=inactive]:hover:text-white'
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
      </motion.div>
    </ProtectedRoute>
  );
}
