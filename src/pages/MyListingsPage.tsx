import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { listingsApi } from '@/api/listings';
import { ListingCard } from '@/components/ListingCard';
import { ListingCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import type { Listing } from '@/types';

const MyListingsPage: React.FC = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'ACTIVE' | 'SOLD'>('ACTIVE');

  useEffect(() => {
    listingsApi.getMyListings().then(setListings).finally(() => setLoading(false));
  }, []);

  const filtered = listings.filter((l) => l.status === tab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-gradient">My Listings</h1>
            <p className="text-muted mt-1">{listings.length} total item{listings.length !== 1 ? 's' : ''}</p>
          </div>
          <Link to="/create">
            <Button id="my-listings-create-btn" variant="primary" leftIcon={<Plus size={16} />}>New Listing</Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 glass-card border border-white/10 p-1 rounded-2xl w-fit mb-8">
          {(['ACTIVE', 'SOLD'] as const).map((t) => (
            <button
              key={t}
              id={`my-listings-tab-${t.toLowerCase()}`}
              onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                tab === t
                  ? 'bg-primary text-white shadow-btn'
                  : 'text-muted hover:text-primary hover:bg-secondary/40'
              }`}
            >
              {t}
              <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${tab === t ? 'bg-white/20' : 'bg-white/5 text-muted'}`}>
                {listings.filter((l) => l.status === t).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => <ListingCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={tab === 'ACTIVE' ? 'No active listings' : 'No sold items yet'}
            description={tab === 'ACTIVE' ? 'Create your first listing and start selling!' : 'Items you sell will appear here.'}
            icon="listings"
            actionLabel={tab === 'ACTIVE' ? 'Create Listing' : undefined}
            actionTo="/create"
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MyListingsPage;

