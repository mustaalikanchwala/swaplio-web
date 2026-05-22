'use client';

import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { useCategories } from '@/hooks/useCategories';
import { ListingCard } from '@/components/listings/ListingCard';
import { ListingGrid, ListingCardSkeleton } from '@/components/listings/ListingGrid';
import type { Condition, ListingFilterParams } from '@/types';
import clsx from 'clsx';
import { useInView } from 'react-intersection-observer';

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'NEW', label: 'Brand New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
];

export default function HomePage() {
  const [page, setPage] = useState(0);
  const [allListings, setAllListings] = useState<import('@/types').Listing[]>([]);
  const [filters, setFilters] = useState<ListingFilterParams>({});
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories = [] } = useCategories();

  const { data, isFetching } = useListings({ ...filters, page, size: 12 });

  // Accumulate pages for Load More
  useEffect(() => {
    if (page === 0) {
      setAllListings(data?.content ?? []);
    } else {
      setAllListings((prev) => [...prev, ...(data?.content ?? [])]);
    }
  }, [data, page]);

  // Reset to page 0 when filters change
  useEffect(() => {
    setPage(0);
  }, [filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, keyword: search || undefined }));
  };

  const setCategory = (id?: string) => {
    setFilters((f) => ({ ...f, categoryId: id }));
  };

  const setCondition = (c?: Condition) => {
    setFilters((f) => ({ ...f, condition: c }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearch('');
  };

  const hasMore = data ? !data.last : false;
  const isFiltered = Object.keys(filters).some((k) => filters[k as keyof ListingFilterParams] !== undefined);

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-1">Browse Listings</h1>
        <p className="text-[var(--text-muted)] text-sm">
          Find second-hand study materials from students near you
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="search"
            placeholder="Search textbooks, notes, equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
            id="listing-search"
          />
        </div>
        <button type="submit" className="btn-primary px-5">Search</button>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className={clsx(
            'btn-ghost px-3',
            showFilters && 'bg-violet-500/15 border-violet-500/40 text-violet-300'
          )}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal size={18} />
        </button>
      </form>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap mb-4">
        <button
          onClick={() => setCategory(undefined)}
          className={clsx(
            'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
            !filters.categoryId
              ? 'border-violet-500/60 bg-violet-500/15 text-violet-300'
              : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-violet-500/40 hover:text-[var(--text-primary)]'
          )}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
              filters.categoryId === cat.id
                ? 'border-violet-500/60 bg-violet-500/15 text-violet-300'
                : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-violet-500/40 hover:text-[var(--text-primary)]'
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Expandable filters */}
      {showFilters && (
        <div className="glass p-4 mb-5 flex flex-wrap gap-4 fade-in-up">
          {/* Condition filter */}
          <div>
            <p className="label mb-2">Condition</p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setCondition(undefined)}
                className={clsx(
                  'px-3 py-1 rounded-lg text-xs border transition-all',
                  !filters.condition
                    ? 'border-violet-500/60 bg-violet-500/15 text-violet-300'
                    : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-violet-500/40'
                )}
              >
                Any
              </button>
              {CONDITIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setCondition(value)}
                  className={clsx(
                    'px-3 py-1 rounded-lg text-xs border transition-all',
                    filters.condition === value
                      ? 'border-violet-500/60 bg-violet-500/15 text-violet-300'
                      : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-violet-500/40'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div className="flex items-end gap-2">
            <div>
              <p className="label mb-2">Min ₹</p>
              <input
                type="number"
                min={0}
                placeholder="0"
                value={filters.minPrice ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    minPrice: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="input w-28"
              />
            </div>
            <div>
              <p className="label mb-2">Max ₹</p>
              <input
                type="number"
                min={0}
                placeholder="Any"
                value={filters.maxPrice ?? ''}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    maxPrice: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                className="input w-28"
              />
            </div>
          </div>

          {isFiltered && (
            <button
              onClick={clearFilters}
              className="btn-ghost text-xs flex items-center gap-1.5 self-end"
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      {data && !isFetching && (
        <p className="text-xs text-[var(--text-muted)] mb-4">
          {data.totalElements} listing{data.totalElements !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Listing grid */}
      {allListings.length === 0 && !isFetching ? (
        <div className="glass p-16 text-center">
          <p className="text-[var(--text-muted)] text-lg">No listings found</p>
          <p className="text-[var(--text-muted)] text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <ListingGrid>
          {allListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} className="fade-in-up" />
          ))}
          {isFetching &&
            Array.from({ length: 4 }).map((_, i) => (
              <ListingCardSkeleton key={`sk-${i}`} />
            ))}
        </ListingGrid>
      )}

      {/* Load More */}
      {hasMore && !isFetching && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="btn-ghost px-8"
          >
            Load more
          </button>
        </div>
      )}
    </div>
  );
}
