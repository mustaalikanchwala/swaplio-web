import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Edit2, CheckCircle, Calendar, User, Tag, Package, ArrowLeft } from 'lucide-react';
import { listingsApi } from '@/api/listings';
import { useAuthStore } from '@/store/authStore';
import { ImageCarousel } from '@/components/ImageCarousel';
import { ScheduleMeetingModal } from '@/components/ScheduleMeetingModal';
import { ConditionBadge, ListingStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatPrice, formatDate } from '@/utils';
import type { Listing } from '@/types';

const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [markingAsSold, setMarkingAsSold] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    listingsApi.getById(id).then(setListing).catch(() => navigate('/')).finally(() => setLoading(false));
  }, [id, navigate]);

  const isOwner = user && listing && String(user.id) === String(listing.seller?.id);

  const handleMarkAsSold = async () => {
    if (!listing) return;
    setMarkingAsSold(true);
    try {
      const updated = await listingsApi.markAsSold(listing.id);
      setListing(updated);
      toast.success('Listing marked as sold!');
    } catch { /* handled */ }
    finally { setMarkingAsSold(false); }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Skeleton className="aspect-video w-full" />
          <div className="flex gap-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-16" />)}</div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  if (!listing) return null;

  return (
    <>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          id="listing-detail-back-btn"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted hover:text-ink mb-7 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Carousel */}
          <div><ImageCarousel images={listing.images ?? []} title={listing.title} /></div>

          {/* Info */}
          <div className="space-y-5">
            {/* Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <ListingStatusBadge status={listing.status} />
              <ConditionBadge condition={listing.condition} />
              {listing.category && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
                  <Tag size={10} />{listing.category.name}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-ink mb-3 leading-snug">
                {listing.title}
              </h1>
              <p className="text-4xl font-bold text-primary">
                {formatPrice(listing.price)}
              </p>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="glass-card rounded-2xl p-4">
                <h2 className="text-xs font-semibold text-primary/60 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Package size={12} /> Description
                </h2>
                <p className="text-muted text-sm leading-relaxed whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Seller */}
            {listing.seller && (
              <div className="surface rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary border border-primary/30 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted font-medium">Listed by</p>
                  <p className="text-ink font-semibold">{listing.seller.fullName}</p>
                  {listing.createdAt && <p className="text-xs text-muted/60">{formatDate(listing.createdAt)}</p>}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {isOwner ? (
                <>
                  <Button id="listing-edit-btn" variant="secondary" size="lg" fullWidth leftIcon={<Edit2 size={16} />} onClick={() => navigate(`/edit/${listing.id}`)}>
                    Edit Listing
                  </Button>
                  {listing.status === 'ACTIVE' && (
                    <Button id="listing-mark-sold-btn" variant="danger" size="lg" fullWidth leftIcon={<CheckCircle size={16} />} loading={markingAsSold} onClick={handleMarkAsSold}>
                      Mark as Sold
                    </Button>
                  )}
                </>
              ) : (
                listing.status !== 'SOLD' && (
                  <Button
                    id="listing-schedule-meeting-btn"
                    variant="primary"
                    size="lg"
                    fullWidth
                    leftIcon={<Calendar size={16} />}
                    onClick={() => { if (!isAuthenticated) { navigate('/login'); return; } setMeetingOpen(true); }}
                  >
                    Schedule Meeting
                  </Button>
                )
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <ScheduleMeetingModal
        isOpen={meetingOpen}
        onClose={() => setMeetingOpen(false)}
        listingId={listing.id}
        listingTitle={listing.title}
      />
    </>
  );
};

export default ListingDetailPage;
