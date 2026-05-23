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

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="shrink-0 w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
        <Icon size={14} className="text-violet-400" />
      </div>
      <div>
        <p className="text-xs text-[var(--text-muted)] mb-0.5">{label}</p>
        <p className="text-sm text-[var(--text-primary)] font-medium">{value}</p>
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
      <div className="page-wrapper flex justify-center items-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-violet-400" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="page-wrapper text-center py-24">
        <p className="text-[var(--text-muted)]">Meeting not found.</p>
        <Link href="/meetings" className="btn-ghost mt-4 inline-flex">Back to Meetings</Link>
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
      <div className="page-wrapper max-w-2xl">
        <Link href="/meetings" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-6 transition-colors">
          <ArrowLeft size={15} /> Back to Meetings
        </Link>

        <div className="glass p-6 mb-4">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">Listing</p>
              <h1 className="text-lg font-bold text-[var(--text-primary)]">{meeting.listingTitle}</h1>
            </div>
            <StatusBadge status={meeting.status} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow icon={Calendar} label="Date" value={dateDisplay} />
            <InfoRow icon={Clock} label="Time" value={`${h}:${m}`} />
            <InfoRow icon={MapPin} label="Location" value={meeting.location} />
            {meeting.notes && <InfoRow icon={FileText} label="Notes" value={meeting.notes} />}
          </div>

          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)] grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-0.5">Buyer</p>
              <p className="font-medium">{meeting.buyerName}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-0.5">Seller</p>
              <p className="font-medium">{meeting.sellerName}</p>
            </div>
          </div>
        </div>

        {/* Proposed reschedule details */}
        {meeting.status === 'RESCHEDULED' && meeting.proposedDate && (
          <div className="glass p-5 mb-4 border border-blue-500/25">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">Proposed Reschedule</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
        <div className="flex flex-wrap gap-3">
          {/* Seller actions on PENDING */}
          {isSeller && meeting.status === 'PENDING' && (
            <>
              <button onClick={() => handleSellerAction('CONFIRM')} disabled={sellerResponding} className="btn-primary" id="confirm-meeting">
                {sellerResponding ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                Confirm
              </button>
              <RescheduleDialog meetingId={id} trigger={
                <button className="btn-ghost" id="reschedule-meeting">
                  <RefreshCw size={15} /> Reschedule
                </button>
              } />
              <button onClick={() => handleSellerAction('REJECT')} disabled={sellerResponding} className="btn-danger" id="reject-meeting">
                <XCircle size={15} /> Reject
              </button>
            </>
          )}

          {/* Buyer actions on RESCHEDULED */}
          {isBuyer && meeting.status === 'RESCHEDULED' && (
            <>
              <button onClick={() => handleBuyerAction('ACCEPT')} disabled={buyerResponding} className="btn-primary" id="accept-reschedule">
                {buyerResponding ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                Accept
              </button>
              <button onClick={() => handleBuyerAction('DECLINE')} disabled={buyerResponding} className="btn-danger" id="decline-reschedule">
                <XCircle size={15} /> Decline
              </button>
            </>
          )}

          {/* Cancel (either party, on PENDING or CONFIRMED) */}
          {(meeting.status === 'PENDING' || meeting.status === 'CONFIRMED') && (isBuyer || isSeller) && (
            <button onClick={handleCancel} disabled={cancelling} className="btn-ghost ml-auto" id="cancel-meeting">
              {cancelling ? <Loader2 size={15} className="animate-spin" /> : null}
              Cancel Meeting
            </button>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

