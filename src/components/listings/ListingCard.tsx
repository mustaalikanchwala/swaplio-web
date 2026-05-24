'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Tag } from 'lucide-react';
import { ConditionBadge } from '@/components/ui/ConditionBadge';
import type { Listing } from '@/types';
import clsx from 'clsx';
import { motion } from 'framer-motion';

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

  return (
    <MotionLink
      href={`/listings/${listing.id}`}
      whileHover={{ scale: 1.01 }}
      className={clsx('block group', className)}
      style={style}
    >
      <div className="glass overflow-hidden h-full flex flex-col transition-all duration-200 border border-bg-border bg-bg-surface hover:border-accent/30 hover:shadow-glow-sm">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-bg-elevated">
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

          {/* Condition badge */}
          <div className="absolute top-2 left-2">
            <ConditionBadge condition={listing.condition} />
          </div>
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
