'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { useMyListings } from '@/hooks/useListings';
import { ListingCard } from '@/components/listings/ListingCard';
import { ListingGrid, ListingCardSkeleton } from '@/components/listings/ListingGrid';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';

export default function MyListingsPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useMyListings({ page, size: 12 });

  return (
    <ProtectedRoute>
      <div className="page-wrapper">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold gradient-text">My Listings</h1>
            <p className="text-[var(--text-muted)] text-sm mt-0.5">
              {data?.totalElements ?? 0} listing{(data?.totalElements ?? 0) !== 1 ? 's' : ''}
            </p>
          </div>
          <Link href="/listings/create" className="btn-primary" id="create-new-listing">
            <PlusCircle size={16} /> New Listing
          </Link>
        </div>

        {isLoading ? (
          <ListingGrid>
            {Array.from({ length: 6 }).map((_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </ListingGrid>
        ) : !data?.content.length ? (
          <div className="glass p-16 text-center">
            <p className="text-[var(--text-muted)] text-lg mb-2">No listings yet</p>
            <Link href="/listings/create" className="btn-primary inline-flex mt-2">
              <PlusCircle size={16} /> Create your first listing
            </Link>
          </div>
        ) : (
          <>
            <ListingGrid>
              {data.content.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </ListingGrid>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="btn-ghost px-5 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm text-[var(--text-muted)]">
                  Page {page + 1} of {data.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={data.last}
                  className="btn-ghost px-5 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
