'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  CheckCircle,
  MessageCircle,
  Calendar,
  Tag,
  User,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useListing, useMarkSold, useDeleteListing } from '@/hooks/useListings';
import { ImageCarousel } from '@/components/listings/ImageCarousel';
import { ConditionBadge } from '@/components/ui/ConditionBadge';
import { RequestMeetingDialog } from '@/components/meetings/RequestMeetingDialog';
import { useAuth } from '@/hooks/useAuth';

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

  const isSeller = !!currentUser && listing?.sellerId === currentUser.id;
  const isBuyer = !!currentUser && !isSeller;
  const isSold = listing?.status === 'SOLD';

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

  // When a signed URL expires and the image fails — refetch the listing
  const handleImageError = () => {
    queryClient.invalidateQueries({ queryKey: ['listing', id] });
  };

  if (isLoading) {
    return (
      <div className="page-wrapper flex items-center justify-center min-h-[60vh]">
        <Loader2 size={32} className="animate-spin text-violet-400" />
      </div>
    );
  }

  if (isError || !listing) {
    return (
      <div className="page-wrapper text-center py-24">
        <p className="text-[var(--text-muted)] text-lg">Listing not found.</p>
        <Link href="/" className="btn-primary mt-4 inline-flex">Browse listings</Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper max-w-5xl">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-6"
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
              <h1 className="text-2xl font-bold text-[var(--text-primary)] leading-tight">
                {listing.title}
              </h1>
              {isSold && (
                <span className="shrink-0 bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Sold
                </span>
              )}
            </div>
            <p className="text-3xl font-extrabold gradient-text">{formatPrice(listing.price)}</p>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-2">
            <ConditionBadge condition={listing.condition} />
            <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] bg-white/5 border border-[var(--border-subtle)] rounded-full px-2.5 py-0.5">
              <Tag size={11} /> {listing.categoryName}
            </span>
          </div>

          {/* Description */}
          <div className="glass p-4">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          {/* Seller info */}
          <div className="flex items-center gap-3 glass p-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
              {listing.sellerName.charAt(0)}
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)]">Listed by</p>
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {listing.sellerName}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          {!isSold && (
            <div className="flex flex-col gap-2 mt-2">
              {/* Buyer actions */}
              {isBuyer && (
                <>
                  <RequestMeetingDialog
                    listingId={listing.id}
                    listingTitle={listing.title}
                    trigger={
                      <button className="btn-primary w-full" id="request-meeting-btn">
                        <Calendar size={16} /> Request a Meeting
                      </button>
                    }
                  />
                  <Link
                    href={`/chat?listingId=${listing.id}`}
                    className="btn-ghost w-full"
                    id="message-seller-btn"
                  >
                    <MessageCircle size={16} /> Message Seller
                  </Link>
                </>
              )}

              {/* Seller actions */}
              {isSeller && (
                <>
                  <Link href={`/listings/${listing.id}/edit`} className="btn-ghost w-full" id="edit-listing-btn">
                    <Edit2 size={16} /> Edit Listing
                  </Link>
                  <button
                    onClick={handleMarkSold}
                    disabled={isMarkingSold}
                    className="btn-ghost w-full"
                    id="mark-sold-btn"
                  >
                    {isMarkingSold ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Mark as Sold
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="btn-danger w-full"
                    id="delete-listing-btn"
                  >
                    {isDeleting ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    Delete Listing
                  </button>
                </>
              )}

              {/* Not logged in */}
              {!currentUser && (
                <Link href="/login" className="btn-primary w-full text-center">
                  Log in to buy or message
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
