'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle,
  XCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useMeeting, useSellerRespond, useBuyerRespond, useCancelMeeting } from '@/hooks/useMeetings';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RescheduleDialog } from '@/components/meetings/RescheduleDialog';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
        <Icon size={14} className="text-accent" />
      </div>
      <div>
        <p className="text-xs text-text-muted mb-0.5 font-sans uppercase tracking-wider font-semibold">{label}</p>
        <p className="text-sm text-white font-sans font-medium">{value}</p>
      </div>
    </div>
  );
}

export default function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const { data: meeting, isLoading } = useMeeting(id);
  const { mutateAsync: sellerRespond, isPending: sellerResponding } = useSellerRespond(id);
  const { mutateAsync: buyerRespond, isPending: buyerResponding } = useBuyerRespond(id);
  const { mutateAsync: cancel, isPending: cancelling } = useCancelMeeting(id);

  if (isLoading) {
    return (
      <div className="page-wrapper max-w-2xl">
        <div className="skeleton h-6 w-32 mb-6" />
        <div className="glass p-6 mb-4">
          <div className="flex justify-between items-center mb-6">
            <div className="skeleton h-6 w-48 rounded" />
            <div className="skeleton h-6 w-20 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="skeleton h-12 w-full rounded" />
            <div className="skeleton h-12 w-full rounded" />
            <div className="skeleton h-12 w-full rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="page-wrapper text-center py-24 flex flex-col items-center gap-4">
        <p className="text-text-muted font-sans">Meeting not found.</p>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link href="/meetings" className="btn-ghost px-6">Back to Meetings</Link>
        </motion.div>
      </div>
    );
  }

  const isBuyer = currentUser?.id === meeting.buyerId;
  const isSeller = currentUser?.id === meeting.sellerId;

  const handleSellerAction = async (action: 'CONFIRM' | 'REJECT') => {
    try {
      await sellerRespond({ action });
      toast.success(action === 'CONFIRM' ? 'Meeting confirmed!' : 'Meeting rejected.');
    } catch {
      toast.error('Action failed.');
    }
  };

  const handleBuyerAction = async (action: 'ACCEPT' | 'DECLINE') => {
    try {
      await buyerRespond({ action });
      toast.success(action === 'ACCEPT' ? 'Reschedule accepted!' : 'Reschedule declined.');
    } catch {
      toast.error('Action failed.');
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this meeting?')) return;
    try {
      await cancel();
      toast.success('Meeting cancelled.');
      router.push('/meetings');
    } catch {
      toast.error('Failed to cancel.');
    }
  };

  const [h, m] = meeting.meetingTime.split(':');
  const dateDisplay = new Date(meeting.meetingDate).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <ProtectedRoute>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="page-wrapper max-w-2xl font-sans"
      >
        <Link href="/meetings" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-white mb-6 transition-colors font-medium">
          <ArrowLeft size={15} /> Back to Meetings
        </Link>

        <div className="glass p-6 mb-4">
          <div className="flex items-start justify-between gap-3 mb-6">
            <div>
              <p className="text-xs text-text-muted mb-1 uppercase tracking-wider font-semibold font-sans">Listing</p>
              <h1 className="text-xl font-bold font-serif text-white">{meeting.listingTitle}</h1>
            </div>
            <StatusBadge status={meeting.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-2">
            <InfoRow icon={Calendar} label="Date" value={dateDisplay} />
            <InfoRow icon={Clock} label="Time" value={`${h}:${m}`} />
            <InfoRow icon={MapPin} label="Location" value={meeting.location} />
            {meeting.notes && <InfoRow icon={FileText} label="Notes" value={meeting.notes} />}
          </div>

          <div className="mt-6 pt-5 border-t border-bg-border grid grid-cols-2 gap-4 text-sm font-sans">
            <div>
              <p className="text-xs text-text-muted mb-0.5 uppercase tracking-wider font-semibold">Buyer</p>
              <p className="font-semibold text-white">{meeting.buyerName}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-0.5 uppercase tracking-wider font-semibold">Seller</p>
              <p className="font-semibold text-white">{meeting.sellerName}</p>
            </div>
          </div>
        </div>

        {/* Proposed reschedule details */}
        {meeting.status === 'RESCHEDULED' && meeting.proposedDate && (
          <div className="glass p-6 mb-4 border-l-4 border-l-accent border border-bg-border bg-accent/5">
            <p className="text-xs font-bold text-accent uppercase tracking-wider mb-4">Proposed Reschedule</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={Calendar} label="New Date" value={new Date(meeting.proposedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} />
              {meeting.proposedTime && (
                <InfoRow icon={Clock} label="New Time" value={meeting.proposedTime.slice(0, 5)} />
              )}
              {meeting.proposedLocation && (
                <InfoRow icon={MapPin} label="New Location" value={meeting.proposedLocation} />
              )}
              {meeting.proposedNotes && (
                <InfoRow icon={FileText} label="Notes" value={meeting.proposedNotes} />
              )}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap gap-3 mt-4">
          {/* Seller actions on PENDING */}
          {isSeller && meeting.status === 'PENDING' && (
            <>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <button onClick={() => handleSellerAction('CONFIRM')} disabled={sellerResponding} className="btn-primary" id="confirm-meeting">
                  <span>Confirm Meeting</span>
                  <span className="btn-primary-circle h-9 w-9">
                    {sellerResponding ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                  </span>
                </button>
              </motion.div>
              
              <RescheduleDialog meetingId={id} trigger={
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="btn-ghost h-12" id="reschedule-meeting">
                  <RefreshCw size={15} /> Reschedule
                </motion.button>
              } />
              
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => handleSellerAction('REJECT')} disabled={sellerResponding} className="btn-danger py-3" id="reject-meeting">
                <XCircle size={15} /> Reject
              </motion.button>
            </>
          )}

          {/* Buyer actions on RESCHEDULED */}
          {isBuyer && meeting.status === 'RESCHEDULED' && (
            <>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <button onClick={() => handleBuyerAction('ACCEPT')} disabled={buyerResponding} className="btn-primary" id="accept-reschedule">
                  <span>Accept Reschedule</span>
                  <span className="btn-primary-circle h-9 w-9">
                    {buyerResponding ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                  </span>
                </button>
              </motion.div>
              
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => handleBuyerAction('DECLINE')} disabled={buyerResponding} className="btn-danger py-3" id="decline-reschedule">
                <XCircle size={15} /> Decline
              </motion.button>
            </>
          )}

          {/* Cancel (either party, on PENDING or CONFIRMED) */}
          {(meeting.status === 'PENDING' || meeting.status === 'CONFIRMED') && (isBuyer || isSeller) && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleCancel} disabled={cancelling} className="btn-ghost ml-auto h-12" id="cancel-meeting">
              {cancelling ? <Loader2 size={15} className="animate-spin mr-1" /> : null}
              Cancel Meeting
            </motion.button>
          )}
        </div>
      </motion.div>
    </ProtectedRoute>
  );
}
