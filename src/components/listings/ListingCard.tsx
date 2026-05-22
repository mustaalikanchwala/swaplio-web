'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Tag } from 'lucide-react';
import { ConditionBadge } from '@/components/ui/ConditionBadge';
import type { Listing } from '@/types';
import clsx from 'clsx';

interface ListingCardProps {
  listing: Listing;
  className?: string;
}

function formatPrice(price: number): string {
  return Number.isInteger(price) ? `₹${price}` : `₹${price.toFixed(2)}`;
}

export function ListingCard({ listing, className }: ListingCardProps) {
  const primaryImage = listing.images?.[0]?.signedUrl;
  const isSold = listing.status === 'SOLD';

  return (
    <Link href={`/listings/${listing.id}`} className={clsx('block group', className)}>
      <div className="glass glass-hover overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-secondary)]">
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
              <Tag size={40} className="text-[var(--text-muted)] opacity-30" />
            </div>
          )}

          {/* SOLD overlay */}
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-red-500/90 text-white text-sm font-bold px-4 py-1.5 rounded-full tracking-widest uppercase shadow-lg">
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
        <div className="p-4 flex flex-col gap-1.5 flex-1">
          <h3 className="font-semibold text-sm text-[var(--text-primary)] line-clamp-2 leading-tight group-hover:text-violet-300 transition-colors">
            {listing.title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <MapPin size={11} />
            <span className="truncate">{listing.categoryName}</span>
          </div>

          <div className="mt-auto pt-2 flex items-center justify-between">
            <span className="text-lg font-bold gradient-text">
              {formatPrice(listing.price)}
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {listing.sellerName}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
