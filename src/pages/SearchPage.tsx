import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';
import { listingsApi } from '@/api/listings';
import { useCategoryStore } from '@/store/categoryStore';
import { ListingCard } from '@/components/ListingCard';
import { ListingCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useInView } from 'react-intersection-observer';
import type { Listing, Condition } from '@/types';

const CONDITIONS: { value: Condition; label: string }[] = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
];

const PAGE_SIZE = 12;

const inputClass =
  'w-full bg-secondary border border-white/10 rounded-xl px-3 py-2 text-sm text-ink ' +
  'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 ' +
  'hover:border-white/20 transition-all placeholder-white/25';

const SearchPage: React.FC = () => {
  const { categories, fetchCategories } = useCategoryStore();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const pageRef = useRef(0);

  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [condition, setCondition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const { ref: sentinelRef, inView } = useInView({ threshold: 0.1 });

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const search = useCallback(async (pageNum: number, reset = false) => {
    if (loading && !reset) return;
    setLoading(true);
    try {
      const params: Record<string, unknown> = { page: pageNum, size: PAGE_SIZE };
      if (keyword) params.keyword = keyword;
      if (categoryId) params.categoryId = categoryId;
      if (condition) params.condition = condition;
      if (minPrice) params.minPrice = Number(minPrice);
      if (maxPrice) params.maxPrice = Number(maxPrice);
      const data = await listingsApi.search(params as Parameters<typeof listingsApi.search>[0]);
      setListings((prev) => (pageNum === 0 || reset ? data.content : [...prev, ...data.content]));
      setHasMore(!data.last);
      pageRef.current = pageNum;
    } catch { /* handled */ }
    finally { setLoading(false); setInitialLoading(false); }
  }, [keyword, categoryId, condition, minPrice, maxPrice, loading]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setInitialLoading(true); search(0, true); }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [keyword, categoryId, condition, minPrice, maxPrice]); // eslint-disable-line

  useEffect(() => {
    if (inView && hasMore && !loading && !initialLoading) search(pageRef.current + 1);
  }, [inView, hasMore]); // eslint-disable-line

  const clearFilters = () => { setKeyword(''); setCategoryId(''); setCondition(''); setMinPrice(''); setMaxPrice(''); };
  const hasActiveFilters = keyword || categoryId || condition || minPrice || maxPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-7">
          <h1 className="text-2xl font-display font-bold text-ink">Search Listings</h1>
          <p className="text-muted text-sm mt-1">Find exactly what you're looking for</p>
        </div>

        {/* Search bar */}
        <div className="mb-5 flex gap-3">
          <div className="flex-1 relative">
            <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="search-keyword-input"
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search for items..."
              className="w-full bg-secondary border border-white/10 rounded-2xl pl-11 pr-10 py-3.5 text-ink placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all shadow-card"
            />
            {keyword && (
              <button id="search-clear-keyword-btn" onClick={() => setKeyword('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors">
                <X size={16} />
              </button>
            )}
          </div>
          <Button
            id="search-filters-toggle-btn"
            variant={showFilters ? 'primary' : 'secondary'}
            size="md"
            leftIcon={<SlidersHorizontal size={16} />}
            onClick={() => setShowFilters((o) => !o)}
          >
            Filters
            {hasActiveFilters && <span className="ml-1 w-2 h-2 rounded-full bg-primary inline-block shadow-glow-soft" />}
          </Button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="glass-card rounded-2xl p-5 mb-5 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-white/50 block mb-1.5">Category</label>
                <select id="search-category-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
                  <option value="">All Categories</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/50 block mb-1.5">Condition</label>
                <select id="search-condition-select" value={condition} onChange={(e) => setCondition(e.target.value)} className={inputClass}>
                  <option value="">Any Condition</option>
                  {CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/50 block mb-1.5">Min Price (₹)</label>
                <input id="search-min-price-input" type="number" min={0} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-white/50 block mb-1.5">Max Price (₹)</label>
                <input id="search-max-price-input" type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Any" className={inputClass} />
              </div>
            </div>
            {hasActiveFilters && (
              <Button id="search-clear-filters-btn" variant="ghost" size="sm" leftIcon={<X size={14} />} onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </motion.div>
        )}

        {/* Category chips */}
        {!showFilters && categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-7">
            <button id="search-cat-all" onClick={() => setCategoryId('')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-smooth ${!categoryId ? 'bg-primary/20 text-primary border border-primary/30 shadow-glow-soft' : 'bg-card text-muted border border-white/10 hover:border-white/20 hover:text-ink'}`}>
              All
            </button>
            {categories.map((cat) => (
              <button key={cat.id} id={`search-cat-${cat.id}`} onClick={() => setCategoryId(String(cat.id))}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-smooth ${String(categoryId) === String(cat.id) ? 'bg-primary/20 text-primary border border-primary/30 shadow-glow-soft' : 'bg-card text-muted border border-white/10 hover:border-white/20 hover:text-ink'}`}>
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {initialLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => <ListingCardSkeleton key={i} />)}
          </div>
        ) : listings.length === 0 ? (
          <EmptyState title="No results found" description="Try different keywords or adjust your filters." icon="search" actionLabel="Clear filters" onAction={clearFilters} />
        ) : (
          <>
            <p className="text-sm text-muted mb-5">Showing {listings.length} result{listings.length !== 1 ? 's' : ''}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {listings.map((listing, i) => <ListingCard key={`${listing.id}-${i}`} listing={listing} />)}
            </div>
            {hasMore && (
              <div ref={sentinelRef} className="mt-8">
                {loading && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => <ListingCardSkeleton key={i} />)}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
};

export default SearchPage;
