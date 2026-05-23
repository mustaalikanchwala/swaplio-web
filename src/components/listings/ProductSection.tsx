'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { ConditionBadge } from '@/components/ui/ConditionBadge';
import { useCategoryListings } from '@/hooks/useCategoryListings';
import type { Category, Listing } from '@/types';
import type { CategoryTheme } from '@/lib/categoryThemes';

// ─── ProductCard ─────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return Number.isInteger(price) ? `₹${price}` : `₹${price.toFixed(2)}`;
}

interface ProductCardProps {
  listing: Listing;
  accentColor: string;
  accentRgb: string;
  index: number;
}

function ProductCard({ listing, accentColor, accentRgb, index }: ProductCardProps) {
  const primaryImage = listing.images?.find((img) => img.isPrimary)?.signedUrl
    ?? listing.images?.[0]?.signedUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="product-card-snap"
    >
      <Link
        href={`/listings/${listing.id}`}
        className="group block h-full"
        id={`product-card-${listing.id}`}
      >
        <div
          className="product-card h-full flex flex-col overflow-hidden rounded-2xl border transition-all duration-300"
          style={{
            background: 'rgba(13, 9, 22, 0.75)',
            backdropFilter: 'blur(20px)',
            borderColor: `rgba(${accentRgb}, 0.15)`,
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.borderColor = `rgba(${accentRgb}, 0.45)`;
            el.style.boxShadow = `0 0 28px rgba(${accentRgb}, 0.15), 0 12px 40px rgba(0,0,0,0.5)`;
            el.style.transform = 'translateY(-4px)';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.borderColor = `rgba(${accentRgb}, 0.15)`;
            el.style.boxShadow = 'none';
            el.style.transform = 'translateY(0)';
          }}
        >
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-secondary)] flex-shrink-0">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={listing.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 72vw, (max-width: 1024px) 38vw, 22vw"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Tag size={36} style={{ color: accentColor, opacity: 0.3 }} />
              </div>
            )}

            {/* Condition badge */}
            <div className="absolute top-2 left-2">
              <ConditionBadge condition={listing.condition} />
            </div>

            {/* Image gradient overlay */}
            <div
              className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
              style={{
                background: `linear-gradient(to top, rgba(13,9,22,0.6), transparent)`,
              }}
            />
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col gap-1.5 flex-1">
            <h3
              className="font-semibold text-sm text-[var(--text-primary)] line-clamp-2 leading-snug transition-colors duration-200"
              style={{ ['--hover-color' as string]: accentColor }}
            >
              <span className="group-hover:text-[var(--text-primary)] transition-colors" style={{}}>
                {listing.title}
              </span>
            </h3>

            <p className="text-xs text-[var(--text-muted)] truncate">{listing.sellerName}</p>

            <div className="mt-auto pt-3 flex items-center justify-between">
              <span
                className="text-lg font-bold"
                style={{ color: accentColor }}
              >
                {formatPrice(listing.price)}
              </span>
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full border"
                style={{
                  color: accentColor,
                  borderColor: `rgba(${accentRgb}, 0.3)`,
                  background: `rgba(${accentRgb}, 0.08)`,
                }}
              >
                {listing.condition.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ProductCardSkeleton({ accentRgb }: { accentRgb: string }) {
  return (
    <div
      className="product-card-snap"
      aria-hidden
    >
      <div
        className="rounded-2xl border overflow-hidden"
        style={{
          background: 'rgba(13, 9, 22, 0.75)',
          borderColor: `rgba(${accentRgb}, 0.12)`,
        }}
      >
        <div className="skeleton aspect-[4/3]" />
        <div className="p-4 flex flex-col gap-2">
          <div className="skeleton h-4 w-4/5 rounded-md" />
          <div className="skeleton h-3 w-2/5 rounded-md" />
          <div className="skeleton h-5 w-1/3 rounded-md mt-2" />
        </div>
      </div>
    </div>
  );
}

// ─── ProductSection ───────────────────────────────────────────────────────────

interface ProductSectionProps {
  category: Category;
  theme: CategoryTheme;
}

export function ProductSection({ category, theme }: ProductSectionProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const { data: listings = [], isLoading, isError } = useCategoryListings(category.id, 10);

  const scroll = (dir: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = sliderRef.current.clientWidth * 0.75;
    sliderRef.current.scrollBy({
      left: dir === 'right' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  // Hide empty sections (no products and not loading)
  if (!isLoading && !isError && listings.length === 0) return null;

  return (
    <div className="relative">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* Icon badge */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-lg"
            style={{
              background: `rgba(${theme.accentRgb}, 0.15)`,
              border: `1px solid rgba(${theme.accentRgb}, 0.25)`,
              boxShadow: `0 4px 16px rgba(${theme.accentRgb}, 0.15)`,
            }}
          >
            {theme.icon}
          </div>

          <div>
            <h2
              className="text-xl sm:text-2xl font-bold tracking-tight leading-tight"
              style={{ color: '#f0eafa' }}
            >
              {category.name}
            </h2>
            {!isLoading && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {listings.length} listing{listings.length !== 1 ? 's' : ''} available
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Prev/Next scroll controls (desktop) */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              className="w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 hover:-translate-y-0.5"
              style={{
                borderColor: `rgba(${theme.accentRgb}, 0.25)`,
                background: `rgba(${theme.accentRgb}, 0.08)`,
                color: theme.accentColor,
              }}
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 hover:-translate-y-0.5"
              style={{
                borderColor: `rgba(${theme.accentRgb}, 0.25)`,
                background: `rgba(${theme.accentRgb}, 0.08)`,
                color: theme.accentColor,
              }}
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* View All CTA */}
          <Link
            href={`/listings?categoryId=${category.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              color: theme.accentColor,
              borderColor: `rgba(${theme.accentRgb}, 0.3)`,
              background: `rgba(${theme.accentRgb}, 0.08)`,
              boxShadow: `0 0 0 0 rgba(${theme.accentRgb}, 0)`,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 4px 20px rgba(${theme.accentRgb}, 0.25)`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 0 0 0 rgba(${theme.accentRgb}, 0)`;
            }}
            id={`view-all-${category.id}`}
          >
            View All
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div
          className="flex items-center justify-center h-40 rounded-2xl border text-sm text-[var(--text-muted)]"
          style={{ borderColor: `rgba(${theme.accentRgb}, 0.1)`, background: `rgba(${theme.accentRgb}, 0.04)` }}
        >
          Failed to load listings. Try refreshing.
        </div>
      )}

      {/* Product Slider */}
      {!isError && (
        <div
          ref={sliderRef}
          className="product-slider"
          role="list"
          aria-label={`${category.name} listings`}
        >
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <ProductCardSkeleton key={`sk-${i}`} accentRgb={theme.accentRgb} />
              ))
            : listings.map((listing, i) => (
                <ProductCard
                  key={listing.id}
                  listing={listing}
                  accentColor={theme.accentColor}
                  accentRgb={theme.accentRgb}
                  index={i}
                />
              ))}

          {/* Trailing fade-out sentinel */}
          <div className="product-card-snap flex-shrink-0 w-4 sm:w-2" />
        </div>
      )}

      {/* Scroll fade gradient — right edge */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-24 hidden sm:block"
        style={{
          background: `linear-gradient(to left, rgba(13,9,22,0.95), transparent)`,
          zIndex: 5,
        }}
      />
    </div>
  );
}
