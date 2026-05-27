'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Edit2,
  Trash2,
  CheckCircle,
  MessageCircle,
  Calendar,
  Tag,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useListing, useMarkSold, useDeleteListing } from '@/hooks/useListings';
import { useConversations } from '@/hooks/useChat';
import { ImageCarousel } from '@/components/listings/ImageCarousel';
import { ConditionBadge } from '@/components/ui/ConditionBadge';
import { RequestMeetingDialog } from '@/components/meetings/RequestMeetingDialog';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { AiQualityCard } from '@/components/listings/AiQualityCard';

function formatPrice(price: number) {
  return Number.isInteger(price) ? `₹${price}` : `₹${price.toFixed(2)}`;
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const { data: listing, isLoading, isError } = useListing(id);
  const { mutateAsync: markSold, isPending: isMarkingSold } = useMarkSold(id);
  const { mutateAsync: deleteListing, isPending: isDeleting } = useDeleteListing();
  const { data: conversations } = useConversations();

  const isSeller = !!currentUser && listing?.sellerId === currentUser.id;
  const isBuyer = !!currentUser && !isSeller;
  const isSold = listing?.status === 'SOLD';

  const handleMessageSeller = () => {
    if (!listing) return;
    const existingConversation = conversations?.find(
      (c) => c.listingId === listing.id
    );

    if (existingConversation) {
      router.push(`/chat/${existingConversation.id}`);
    } else {
      router.push(`/chat/new?listingId=${listing.id}`);
    }
  };

  const handleMarkSold = async () => {
    if (!confirm('Mark this listing as sold?')) return;
    try {
      await markSold();
      toast.success('Listing marked as sold!');
    } catch {
      toast.error('Failed to mark as sold.');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    try {
      await deleteListing(id);
      toast.success('Listing deleted.');
      router.push('/my-listings');
    } catch {
      toast.error('Failed to delete listing.');
    }
  };

  const handleImageError = () => {
    queryClient.invalidateQueries({ queryKey: ['listing', id] });
  };

  if (isLoading) {
    return (
      <div className="page-wrapper max-w-5xl">
        <div className="skeleton h-6 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="skeleton aspect-square rounded-2xl" />
          <div className="flex flex-col gap-4">
            <div className="skeleton h-10 w-3/4 rounded-md" />
            <div className="skeleton h-12 w-1/3 rounded-md" />
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton h-24 w-full rounded-2xl" />
            <div className="skeleton h-16 w-full rounded-2xl" />
            <div className="skeleton h-12 w-full rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="page-wrapper text-center py-24 flex flex-col items-center gap-4">
        <p className="text-text-muted text-lg">Listing not found.</p>
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          <Link href="/" className="btn-primary">
            <span>Browse Listings</span>
            <span className="btn-primary-circle">
              <ArrowLeft size={16} />
            </span>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="page-wrapper max-w-5xl bg-black"
    >
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-white transition-colors mb-6 font-sans font-medium"
      >
        <ArrowLeft size={15} /> Back to listings
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left — images */}
        <div>
          <ImageCarousel images={listing.images} onImageError={handleImageError} />
        </div>

        {/* Right — details */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-4xl font-bold text-white font-serif leading-tight">
                {listing.title}
              </h1>
              {isSold && (
                <span className="shrink-0 bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Sold
                </span>
              )}
            </div>
            <p className="text-5xl font-extrabold bg-gradient-to-b from-white via-white to-[#b4c0ff] bg-clip-text text-transparent font-sans">
              {formatPrice(listing.price)}
            </p>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-2">
            <ConditionBadge condition={listing.condition} />
            <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary bg-bg-surface border border-bg-border rounded-full px-3 py-1 font-sans font-medium">
              <Tag size={11} className="text-text-muted" /> {listing.categoryName}
            </span>
          </div>

          {/* Description */}
          <div className="glass p-5">
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap font-sans">
              {listing.description}
            </p>
          </div>

          {/* AI Quality Card — appears once async check completes (refresh after ~5s) */}
          {listing.aiQualityCheck && (
            <AiQualityCard
              score={listing.aiQualityCheck.score}
              tips={listing.aiQualityCheck.tips}
              compact={false}
            />
          )}

          {/* Seller info */}
          <div className="flex items-center gap-3 glass p-4">
            <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-semibold text-sm shadow-glow-sm">
              {listing.sellerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs text-text-muted font-sans">Listed by</p>
              <p className="text-sm font-semibold text-white font-sans">
                {listing.sellerName}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          {!isSold && (
            <div className="flex flex-col gap-3 mt-2">
              {/* Buyer actions */}
              {isBuyer && (
                <>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full">
                    <button
                      onClick={handleMessageSeller}
                      className="btn-primary w-full"
                      id="message-seller-btn"
                    >
                      <span>Message Seller</span>
                      <span className="btn-primary-circle">
                        <MessageCircle size={18} />
                      </span>
                    </button>
                  </motion.div>

                  <RequestMeetingDialog
                    listingId={listing.id}
                    listingTitle={listing.title}
                    trigger={
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="btn-ghost w-full flex items-center justify-center gap-2"
                        id="request-meeting-btn"
                      >
                        <Calendar size={16} /> Request a Meeting
                      </motion.button>
                    }
                  />
                </>
              )}

              {/* Seller actions */}
              {isSeller && (
                <>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full">
                    <Link
                      href={`/listings/${listing.id}/edit`}
                      className="btn-ghost w-full text-center"
                      id="edit-listing-btn"
                    >
                      <Edit2 size={16} className="inline mr-2" /> Edit Listing
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full">
                    <button
                      onClick={handleMarkSold}
                      disabled={isMarkingSold}
                      className="btn-ghost w-full flex items-center justify-center gap-2 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 hover:border-yellow-500/50"
                      id="mark-sold-btn"
                    >
                      {isMarkingSold ? (
                        <Loader2 size={15} className="animate-spin text-yellow-400" />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                      Mark as Sold
                    </button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full">
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="btn-danger w-full flex items-center justify-center gap-2"
                      id="delete-listing-btn"
                    >
                      {isDeleting ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                      Delete Listing
                    </button>
                  </motion.div>
                </>
              )}

              {/* Not logged in */}
              {!currentUser && (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-full">
                  <Link href="/login" className="btn-primary w-full">
                    <span>Log in to buy or message</span>
                    <span className="btn-primary-circle">
                      <ArrowRight size={18} />
                    </span>
                  </Link>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
