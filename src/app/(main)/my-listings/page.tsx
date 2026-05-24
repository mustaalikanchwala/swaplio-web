'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, ShoppingBag, Edit2, Trash2, Tag, Loader2, ArrowRight } from 'lucide-react';
import { useMyListings, useDeleteListing } from '@/hooks/useListings';
import { ListingGrid, ListingCardSkeleton } from '@/components/listings/ListingGrid';
import { ConditionBadge } from '@/components/ui/ConditionBadge';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import type { Listing } from '@/types';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

function MyListingCard({
  listing,
  onDelete,
}: {
  listing: Listing;
  onDelete: (id: string) => void;
}) {
  const primaryImage = listing.images?.[0]?.signedUrl;
  const isSold = listing.status === 'SOLD';

  return (
    <div className="relative group rounded-2xl overflow-hidden border border-bg-border bg-bg-surface hover:border-accent/30 hover:shadow-glow-sm transition-all duration-200 flex flex-col h-full">
      {/* Image container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-bg-elevated shrink-0">
        {primaryImage ? (
          <Image
            src={primaryImage}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-bg-elevated">
            <Tag size={40} className="text-text-muted opacity-30" />
          </div>
        )}

        {/* SOLD Overlay */}
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10 animate-fade-in">
            <span className="text-white font-serif text-2xl font-bold tracking-wider uppercase">
              SOLD
            </span>
          </div>
        )}

        {/* Condition Badge */}
        <div className="absolute top-2 left-2 z-10">
          <ConditionBadge condition={listing.condition} />
        </div>

        {/* Quick action buttons on hover (only when not sold) */}
        {!isSold && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 z-10">
            <Link
              href={`/listings/${listing.id}/edit`}
              className="p-3 rounded-full bg-white text-black hover:bg-white/90 hover:scale-110 transition-all shadow-lg flex items-center justify-center"
              title="Edit Listing"
            >
              <Edit2 size={16} />
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                onDelete(listing.id);
              }}
              className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700 hover:scale-110 transition-all shadow-lg flex items-center justify-center"
              title="Delete Listing"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-1.5 flex-1 font-sans">
        <h3 className="font-semibold text-sm text-white line-clamp-2 leading-tight">
          {listing.title}
        </h3>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-base font-bold text-white font-sans">
            ₹{listing.price}
          </span>
          <span className="text-xs text-text-muted">
            {listing.categoryName}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MyListingsPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, refetch } = useMyListings({ page, size: 12 });
  const { mutateAsync: deleteListing } = useDeleteListing();

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    try {
      await deleteListing(id);
      toast.success('Listing deleted.');
      refetch();
    } catch {
      toast.error('Failed to delete listing.');
    }
  };

  return (
    <ProtectedRoute>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="page-wrapper font-sans"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold font-serif text-white">My Listings</h1>
            <p className="text-text-secondary text-sm mt-0.5">
              {data?.totalElements ?? 0} listing{(data?.totalElements ?? 0) !== 1 ? 's' : ''} total
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link href="/listings/create" className="btn-primary" id="create-new-listing">
              <span>New Listing</span>
              <span className="btn-primary-circle">
                <PlusCircle size={16} />
              </span>
            </Link>
          </motion.div>
        </div>

        {isLoading ? (
          <ListingGrid>
            {Array.from({ length: 4 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </ListingGrid>
        ) : !data?.content.length ? (
          <div className="glass p-16 text-center flex flex-col items-center justify-center gap-4">
            <ShoppingBag size={48} className="text-text-muted opacity-30 mx-auto" />
            <h2 className="text-2xl font-serif text-white">No listings yet</h2>
            <p className="text-text-secondary text-sm max-w-sm">You haven&apos;t posted any study materials for sale. Start selling your items now!</p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/listings/create" className="btn-primary">
                <span>Create first listing</span>
                <span className="btn-primary-circle">
                  <PlusCircle size={16} />
                </span>
              </Link>
            </motion.div>
          </div>
        ) : (
          <>
            <ListingGrid>
              {data.content.map((listing) => (
                <MyListingCard key={listing.id} listing={listing} onDelete={handleDelete} />
              ))}
            </ListingGrid>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="btn-ghost px-5 disabled:opacity-40"
                >
                  Previous
                </motion.button>
                <span className="text-sm text-text-muted font-sans font-semibold">
                  Page {page + 1} of {data.totalPages}
                </span>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setPage((p) => p + 1)}
                  disabled={data.last}
                  className="btn-ghost px-5 disabled:opacity-40"
                >
                  Next
                </motion.button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </ProtectedRoute>
  );
}
