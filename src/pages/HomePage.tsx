import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { useInView } from 'react-intersection-observer';
import { listingsApi } from '@/api/listings';
import { ListingCard } from '@/components/ListingCard';
import { ListingCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import type { Listing } from '@/types';

const PAGE_SIZE = 12;

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);
  const { ref: sentinelRef, inView } = useInView({ threshold: 0.1 });

  const fetchListings = useCallback(async (pageNum: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await listingsApi.getAll(pageNum, PAGE_SIZE);
      setListings((prev) => (pageNum === 0 ? data.content : [...prev, ...data.content]));
      setHasMore(!data.last);
      pageRef.current = pageNum;
    } catch { /* handled */ }
    finally { setLoading(false); setInitialLoading(false); }
  }, [loading]);

  useEffect(() => { fetchListings(0); }, []); // eslint-disable-line
  useEffect(() => {
    if (inView && hasMore && !loading && !initialLoading) fetchListings(pageRef.current + 1);
  }, [inView, hasMore]); // eslint-disable-line

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="mb-16 text-center"
      >
        <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full text-sm text-primary font-medium mb-7 backdrop-blur-sm">
          <Sparkles size={14} className="text-accent" />
          Student Marketplace
        </div>
        <h1 className="text-5xl md:text-7xl font-display font-bold mb-5 leading-tight tracking-tight">
          <span className="text-gradient">Swap. Sell. Score.</span>
        </h1>
        <p className="text-muted text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          The premium campus marketplace built for students. Find great deals on everything you need.
        </p>
        {!isAuthenticated && (
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/register">
              <Button id="hero-signup-btn" variant="primary" size="lg" leftIcon={<Plus size={18} />}>
                Start Selling
              </Button>
            </Link>
            <Link to="/search">
              <Button id="hero-browse-btn" variant="outline" size="lg" rightIcon={<ArrowRight size={16} />}>
                Browse Items
              </Button>
            </Link>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      {!isAuthenticated && (
        <div className="grid grid-cols-3 gap-4 mb-14 max-w-2xl mx-auto">
          {[
            { label: 'Students', value: '5,000+' },
            { label: 'Listings', value: '2,400+' },
            { label: 'Colleges', value: '120+' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i + 0.3 }}
              className="glass-card rounded-2xl p-5 text-center transition-smooth hover-lift hover:border-primary/30"
            >
              <p className="text-2xl font-bold text-gradient-primary font-display tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Section header */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-6 bg-primary rounded-full shadow-glow-soft" />
          <h2 className="text-2xl font-display font-semibold text-ink flex items-center gap-2 tracking-tight">
            <TrendingUp size={20} className="text-primary" />
            Latest Listings
          </h2>
        </div>
        <Link to="/search" id="home-view-all-link">
          <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />}>View all</Button>
        </Link>
      </div>

      {/* Grid */}
      {initialLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      ) : listings.length === 0 ? (
        <EmptyState title="No listings yet" description="Be the first to list something on Swaplio!" icon="listings" actionLabel="Create Listing" actionTo="/create" />
      ) : (
        <>
          <motion.div
            initial="hidden" animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
          >
            {listings.map((listing, i) => (
              <motion.div
                key={`${listing.id}-${i}`}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              >
                <ListingCard listing={listing} />
              </motion.div>
            ))}
          </motion.div>

          {hasMore && (
            <div ref={sentinelRef} className="mt-8">
              {loading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => <ListingCardSkeleton key={i} />)}
                </div>
              )}
            </div>
          )}

          {!hasMore && listings.length > 0 && (
            <p className="text-center text-muted text-sm mt-14 pb-4">You've seen everything ✨</p>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
