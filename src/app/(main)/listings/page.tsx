'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X, Tag } from 'lucide-react';
import { useListings } from '@/hooks/useListings';
import { useCategories } from '@/hooks/useCategories';
import { ListingCard } from '@/components/listings/ListingCard';
import { ListingGrid, ListingCardSkeleton } from '@/components/listings/ListingGrid';
import type { Condition, ListingFilterParams } from '@/types';
import clsx from 'clsx';
import { motion } from 'framer-motion';

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'NEW', label: 'Brand New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
];

function BrowsePageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [page, setPage] = useState(0);
  const [allListings, setAllListings] = useState<import('@/types').Listing[]>([]);
  const [filters, setFilters] = useState<ListingFilterParams>({
    keyword: searchParams.get('keyword') ?? undefined,
    categoryId: searchParams.get('categoryId') ?? undefined,
  });
  const [search, setSearch] = useState(searchParams.get('keyword') ?? '');
  const [showFilters, setShowFilters] = useState(false);

  const { data: categories = [] } = useCategories();
  const { data, isFetching } = useListings({ ...filters, page, size: 12 });

  useEffect(() => {
    if (page === 0) {
      setAllListings(data?.content ?? []);
    } else {
      setAllListings((prev) => [...prev, ...(data?.content ?? [])]);
    }
  }, [data, page]);

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
    router.replace('/listings');
  };

  const hasMore = data ? !data.last : false;
  const isFiltered = Object.keys(filters).some(
    (k) => filters[k as keyof ListingFilterParams] !== undefined
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="page-wrapper"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-serif text-white mb-1">Browse Listings</h1>
        <p className="text-text-secondary text-sm">
          Find second-hand study materials from students near you
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            placeholder="Search textbooks, notes, equipment..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-11 rounded-full h-12"
            id="listing-search"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          className="btn-primary"
        >
          <span>Search</span>
          <span className="btn-primary-circle">
            <Search size={18} />
          </span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className={clsx(
            'btn-ghost px-4 rounded-full h-12',
            showFilters && 'bg-white/5 border-white/30 text-white'
          )}
          aria-label="Toggle filters"
        >
          <SlidersHorizontal size={18} />
        </motion.button>
      </form>

      {/* Category chips */}
      <div className="flex gap-2 flex-wrap mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setCategory(undefined)}
          className={clsx(
            'px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200',
            !filters.categoryId
              ? 'border-accent/40 bg-accent/20 text-white'
              : 'border-bg-border bg-bg-elevated text-text-secondary hover:border-white/20 hover:text-white'
          )}
        >
          All
        </motion.button>
        {categories.map((cat) => (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setCategory(cat.id)}
            className={clsx(
              'px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200',
              filters.categoryId === cat.id
                ? 'border-accent/40 bg-accent/20 text-white'
                : 'border-bg-border bg-bg-elevated text-text-secondary hover:border-white/20 hover:text-white'
            )}
          >
            {cat.name}
          </motion.button>
        ))}
      </div>

      {/* Expandable filters */}
      {showFilters && (
        <div className="glass p-5 mb-5 flex flex-wrap gap-6 fade-in-up">
          {/* Condition filter */}
          <div>
            <p className="label mb-2">Condition</p>
            <div className="flex gap-2 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCondition(undefined)}
                className={clsx(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200',
                  !filters.condition
                    ? 'border-accent/40 bg-accent/20 text-white'
                    : 'border-bg-border bg-bg-elevated text-text-secondary hover:border-white/20'
                )}
              >
                Any
              </motion.button>
              {CONDITIONS.map(({ value, label }) => (
                <motion.button
                  key={value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCondition(value)}
                  className={clsx(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200',
                    filters.condition === value
                      ? 'border-accent/40 bg-accent/20 text-white'
                      : 'border-bg-border bg-bg-elevated text-text-secondary hover:border-white/20'
                  )}
                >
                  {label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div className="flex items-end gap-3">
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
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clearFilters}
              className="btn-ghost text-xs flex items-center gap-1.5 self-end h-10 px-4 rounded-full"
            >
              <X size={12} /> Clear filters
            </motion.button>
          )}
        </div>
      )}

      {/* Results count */}
      {data && !isFetching && (
        <p className="text-xs text-text-muted mb-4 font-sans">
          {data.totalElements} listing{data.totalElements !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Listing grid */}
      {allListings.length === 0 && !isFetching ? (
        <div className="glass p-16 text-center flex flex-col items-center justify-center gap-4">
          <Tag size={48} className="text-text-muted opacity-30" />
          <h2 className="text-2xl font-serif text-white">Nothing here yet</h2>
          <p className="text-text-secondary text-sm max-w-sm">No listings match your filter criteria. Try adjusting your filters or search terms.</p>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <button
              onClick={clearFilters}
              className="btn-primary"
            >
              <span>Reset Filters</span>
              <span className="btn-primary-circle">
                <X size={18} />
              </span>
            </button>
          </motion.div>
        </div>
      ) : (
        <ListingGrid>
          {allListings.map((listing, index) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              className="fade-in-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            />
          ))}
          {isFetching &&
            Array.from({ length: 4 }).map((_, i) => <ListingCardSkeleton key={`sk-${i}`} />)}
        </ListingGrid>
      )}

      {/* Load More */}
      {hasMore && !isFetching && (
        <div className="flex justify-center mt-8">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setPage((p) => p + 1)}
            className="btn-ghost px-8"
          >
            Load more
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="page-wrapper">
        <div className="skeleton h-9 w-56 rounded-lg mb-2" />
        <div className="skeleton h-4 w-72 rounded mb-8" />
        <div className="skeleton h-12 w-full rounded-xl mb-5" />
      </div>
    }>
      <BrowsePageInner />
    </Suspense>
  );
}
