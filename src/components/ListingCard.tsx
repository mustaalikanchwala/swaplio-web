import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatPrice } from '@/utils';
import { ConditionBadge } from '@/components/ui/Badge';
import type { Listing } from '@/types';

interface ListingCardProps { listing: Listing; }

export const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const primaryImage = listing.images?.find((img) => img.isPrimary) ?? listing.images?.[0];

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <Link to={`/listings/${listing.id}`} id={`listing-card-${listing.id}`}>
        <div className="surface rounded-3xl overflow-hidden group cursor-pointer h-full transition-smooth hover-lift hover:border-primary/40">
          {/* Image */}
          <div className="relative overflow-hidden h-48 bg-secondary">
            {primaryImage ? (
              <img
                src={primaryImage.signedUrl}
                alt={listing.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108 opacity-90 group-hover:opacity-100"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary/20 bg-secondary/30">
                <svg width="52" height="52" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" strokeWidth="1.5"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* Sold overlay */}
            {listing.status === 'SOLD' && (
              <div className="absolute inset-0 bg-base/70 backdrop-blur-sm flex items-center justify-center">
                <span className="text-danger font-bold text-lg uppercase tracking-widest border border-danger/40 px-4 py-1 rounded-xl bg-danger/20 backdrop-blur-md">
                  Sold
                </span>
              </div>
            )}

            {/* Image count */}
            {listing.images && listing.images.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-base/70 backdrop-blur-sm text-xs text-muted px-2 py-0.5 rounded-lg">
                +{listing.images.length - 1}
              </div>
            )}

            {/* Hover glow line */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Content */}
          <div className="p-4 space-y-2">
            <h3 className="font-semibold text-ink/90 text-sm leading-tight line-clamp-2 group-hover:text-ink transition-colors">
              {listing.title}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary group-hover:text-highlight transition-colors">
                {formatPrice(listing.price)}
              </span>
              <ConditionBadge condition={listing.condition} />
            </div>
            {listing.category && (
              <p className="text-xs text-muted truncate">{listing.category.name}</p>
            )}
            {listing.seller && (
              <p className="text-xs text-muted/60 truncate">by {listing.seller.fullName}</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
