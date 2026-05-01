import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';
import { meetingsApi } from '@/api/meetings';
import { MeetingStatusBadge } from '@/components/ui/Badge';
import { MeetingCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils';
import type { Meeting } from '@/types';

const MeetingCard: React.FC<{ meeting: Meeting; role: 'buyer' | 'seller' }> = ({ meeting, role }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card rounded-2xl p-5 border border-white/10 transition-smooth hover-lift hover:border-primary/30"
  >
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex-1">
        <Link
          to={`/listings/${meeting.listing?.id}`}
          id={`meeting-listing-link-${meeting.id}`}
          className="font-semibold text-ink hover:text-primary transition-colors flex items-center gap-1.5 group"
        >
          {meeting.listing?.title ?? 'Unknown Listing'}
          <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
        </Link>
        <p className="text-sm text-muted mt-0.5">
          {role === 'buyer' ? `Seller: ${meeting.seller?.fullName}` : `Buyer: ${meeting.buyer?.fullName}`}
        </p>
      </div>
      <MeetingStatusBadge status={meeting.status} />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      <div className="flex items-center gap-2 text-sm text-white/70">
        <Calendar size={14} className="text-primary/60 flex-shrink-0" />
        <span>{meeting.meetingDate ? formatDate(meeting.meetingDate) : '—'}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-white/70">
        <Clock size={14} className="text-primary/60 flex-shrink-0" />
        <span>{meeting.meetingTime ?? '—'}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-white/70">
        <MapPin size={14} className="text-primary/60 flex-shrink-0" />
        <span className="truncate">{meeting.location ?? '—'}</span>
      </div>
    </div>

    {meeting.notes && (
      <p className="mt-3 text-xs text-muted bg-secondary/50 rounded-xl px-3 py-2 border border-white/10">
        {meeting.notes}
      </p>
    )}
  </motion.div>
);

const MeetingsPage: React.FC = () => {
  const [tab, setTab] = useState<'buying' | 'selling'>('buying');
  const [buyingMeetings, setBuyingMeetings] = useState<Meeting[]>([]);
  const [sellingMeetings, setSellingMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoth = async () => {
      setLoading(true);
      try {
        const [buying, selling] = await Promise.all([meetingsApi.getBuying(), meetingsApi.getSelling()]);
        setBuyingMeetings(buying);
        setSellingMeetings(selling);
      } catch { /* handled */ }
      finally { setLoading(false); }
    };
    fetchBoth();
  }, []);

  const meetings = tab === 'buying' ? buyingMeetings : sellingMeetings;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gradient">Meetings</h1>
          <p className="text-muted mt-1">Your scheduled meet-ups with buyers & sellers</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 glass-card border border-white/10 p-1 rounded-2xl w-fit mb-8">
          {(['buying', 'selling'] as const).map((t) => (
            <button
              key={t}
              id={`meetings-tab-${t}`}
              onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-200 ${tab === t
                  ? 'bg-primary text-white shadow-btn'
                  : 'text-muted hover:text-primary hover:bg-secondary/40'
                }`}
            >
              {t}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${tab === t ? 'bg-white/20' : 'bg-white/5 text-muted'}`}>
                {(t === 'buying' ? buyingMeetings : sellingMeetings).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <MeetingCardSkeleton key={i} />)}
          </div>
        ) : meetings.length === 0 ? (
          <EmptyState
            title={tab === 'buying' ? 'No meetings as buyer' : 'No meetings as seller'}
            description={tab === 'buying' ? 'When you schedule a meeting with a seller, it will appear here.' : 'When buyers schedule meetings with you, they\'ll appear here.'}
            icon="meetings"
          />
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} role={tab === 'buying' ? 'buyer' : 'seller'} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MeetingsPage;

