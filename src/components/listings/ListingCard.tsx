'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Tag, Sparkles } from 'lucide-react';
import { ConditionBadge } from '@/components/ui/ConditionBadge';
import { AiQualityCard } from '@/components/listings/AiQualityCard';
import type { Listing } from '@/types';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface ListingCardProps {
  listing: Listing;
  className?: string;
  style?: React.CSSProperties;
}

function formatPrice(price: number): string {
  return Number.isInteger(price) ? `₹${price}` : `₹${price.toFixed(2)}`;
}

const MotionLink = motion(Link);

export function ListingCard({ listing, className, style }: ListingCardProps) {
  const primaryImage = listing.images?.[0]?.signedUrl;
  const isSold = listing.status === 'SOLD';
  const [showQuality, setShowQuality] = useState(false);

  return (
    <MotionLink
      href={`/listings/${listing.id}`}
      whileHover={{ scale: 1.01 }}
      className={clsx('block group', className)}
      style={style}
      // Tooltip only shows on devices that support hover
      onMouseEnter={() => {
        if (listing.aiQualityCheck) setShowQuality(true);
      }}
      onMouseLeave={() => setShowQuality(false)}
    >
      {/* Outer div: overflow-visible so the tooltip can appear above the card */}
      <div className="glass overflow-visible h-full flex flex-col transition-all duration-200 border border-bg-border bg-bg-surface hover:border-accent/30 hover:shadow-glow-sm relative">

        {/* Hover tooltip — compact quality card, appears above the card */}
        <AnimatePresence>
          {showQuality && listing.aiQualityCheck && (
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-full left-0 mb-2 z-50"
              onMouseEnter={() => setShowQuality(true)}
              onMouseLeave={() => setShowQuality(false)}
            >
              <AiQualityCard
                score={listing.aiQualityCheck.score}
                tips={listing.aiQualityCheck.tips}
                compact={true}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image — overflow-hidden applied here only, not on outer div */}
        <div className="relative aspect-[4/3] overflow-hidden bg-bg-elevated rounded-t-[inherit]">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={listing.title}
              fill
              className={clsx(
                'object-cover transition-transform duration-500 group-hover:scale-105',
                isSold && 'opacity-50 grayscale'
              )}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Tag size={40} className="text-text-muted opacity-30" />
            </div>
          )}

          {/* SOLD overlay */}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
              <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold px-4 py-1.5 rounded-full tracking-widest uppercase shadow-lg">
                Sold
              </span>
            </div>
          )}

          {/* Condition badge — top-left */}
          <div className="absolute top-2 left-2">
            <ConditionBadge condition={listing.condition} />
          </div>

          {/* AI score badge — top-right, always visible when aiQualityCheck exists */}
          {listing.aiQualityCheck && (
            <div
              className={clsx(
                'absolute top-2 right-2 z-10',
                'flex items-center gap-1 rounded-full px-2 py-0.5',
                'backdrop-blur-sm text-[10px] font-bold',
                listing.aiQualityCheck.score >= 7
                  ? 'bg-green-500/80 text-white'
                  : listing.aiQualityCheck.score >= 4
                  ? 'bg-yellow-500/80 text-black'
                  : 'bg-red-500/80 text-white'
              )}
            >
              <Sparkles className="w-2.5 h-2.5" />
              {listing.aiQualityCheck.score}/10
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-1.5 flex-1 font-sans">
          <h3 className="font-semibold text-sm text-white line-clamp-2 leading-tight group-hover:text-white transition-colors">
            {listing.title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <MapPin size={11} />
            <span className="truncate">{listing.categoryName}</span>
          </div>

          <div className="mt-auto pt-2 flex items-center justify-between">
            <span className="text-base font-bold text-white font-sans">
              {formatPrice(listing.price)}
            </span>
            <span className="text-xs text-text-muted">
              {listing.sellerName}
            </span>
          </div>
        </div>
      </div>
    </MotionLink>
  );
}

