'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Tag, RefreshCw } from 'lucide-react';
import { ConditionBadge } from '@/components/ui/ConditionBadge';
import { useCategoryListings } from '@/hooks/useCategoryListings';
import { getCategoryTheme } from '@/lib/categoryThemes';
import type { Category, Listing } from '@/types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return Number.isInteger(price) ? `₹${price}` : `₹${price.toFixed(2)}`;
}

// ─── ProductCard ─────────────────────────────────────────────────────────────

interface ProductCardProps {
  listing: Listing;
  accentColor: string;
  accentRgb: string;
  index: number;
}

function ProductCard({ listing, accentColor, accentRgb, index }: ProductCardProps) {
  const primaryImage =
    listing.images?.find((img) => img.isPrimary)?.signedUrl ??
    listing.images?.[0]?.signedUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
      className="product-card-snap"
      role="listitem"
    >
      <Link
        href={`/listings/${listing.id}`}
        className="group block h-full"
        id={`product-card-${listing.id}`}
      >
        <div
          className="h-full flex flex-col overflow-hidden rounded-2xl border"
          style={{
            background: 'rgba(13, 9, 22, 0.78)',
            backdropFilter: 'blur(20px)',
            borderColor: `rgba(${accentRgb}, 0.15)`,
            transition: 'border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.borderColor = `rgba(${accentRgb}, 0.5)`;
            el.style.boxShadow = `0 0 32px rgba(${accentRgb}, 0.18), 0 16px 48px rgba(0,0,0,0.55)`;
            el.style.transform = 'translateY(-5px)';
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
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <Tag size={32} style={{ color: accentColor, opacity: 0.25 }} />
                <span className="text-[10px] text-[var(--text-muted)] opacity-50">No photo</span>
              </div>
            )}

            {/* Condition badge */}
            <div className="absolute top-2 left-2">
              <ConditionBadge condition={listing.condition} />
            </div>

            {/* Subtle bottom gradient */}
            <div
              className="absolute inset-x-0 bottom-0 h-10 pointer-events-none"
              style={{ background: `linear-gradient(to top, rgba(13,9,22,0.65), transparent)` }}
            />
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col gap-1.5 flex-1">
            <h3 className="font-semibold text-sm text-[var(--text-primary)] line-clamp-2 leading-snug group-hover:opacity-80 transition-opacity">
              {listing.title}
            </h3>

            <p className="text-xs text-[var(--text-muted)] truncate">{listing.sellerName}</p>

            <div className="mt-auto pt-3 flex items-center justify-between gap-2">
              <span className="text-base font-bold" style={{ color: accentColor }}>
                {formatPrice(listing.price)}
              </span>
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full border flex-shrink-0"
                style={{
                  color: accentColor,
                  borderColor: `rgba(${accentRgb}, 0.3)`,
                  background: `rgba(${accentRgb}, 0.08)`,
                }}
              >
                {listing.condition.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard({ accentRgb }: { accentRgb: string }) {
  return (
    <div className="product-card-snap" aria-hidden>
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: 'rgba(13,9,22,0.78)', borderColor: `rgba(${accentRgb}, 0.12)` }}
      >
        <div className="skeleton aspect-[4/3]" />
        <div className="p-4 flex flex-col gap-2.5">
          <div className="skeleton h-3.5 w-4/5 rounded-md" />
          <div className="skeleton h-3 w-2/5 rounded-md" />
          <div className="flex justify-between items-center mt-1">
            <div className="skeleton h-5 w-1/3 rounded-md" />
            <div className="skeleton h-4 w-1/4 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

interface ErrorStateProps {
  accentRgb: string;
  accentColor: string;
  onRetry: () => void;
}

function ErrorState({ accentRgb, accentColor, onRetry }: ErrorStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 h-40 rounded-2xl border"
      style={{
        borderColor: `rgba(${accentRgb}, 0.15)`,
        background: `rgba(${accentRgb}, 0.04)`,
      }}
    >
      <p className="text-sm text-[var(--text-muted)]">Failed to load products</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:scale-105"
        style={{
          color: accentColor,
          borderColor: `rgba(${accentRgb}, 0.3)`,
          background: `rgba(${accentRgb}, 0.08)`,
        }}
      >
        <RefreshCw size={11} />
        Retry
      </button>
    </div>
  );
}

// ─── CategorySection (unified) ────────────────────────────────────────────────
// This component owns its own data fetching. It renders the entire section
// (background + content) only when there is data, and returns null when the
// category has no listings — preventing empty decorated panels.

interface CategorySectionProps {
  category: Category;
  index?: number;
}

export function CategorySection({ category, index = 0 }: CategorySectionProps) {
  const theme = getCategoryTheme(category.slug ?? category.name);
  const sliderRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  const {
    data: listings = [],
    isLoading,
    isError,
    refetch,
  } = useCategoryListings(category.id, 10);

  const scroll = (dir: 'left' | 'right') => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({
      left: dir === 'right'
        ? sliderRef.current.clientWidth * 0.75
        : -sliderRef.current.clientWidth * 0.75,
      behavior: 'smooth',
    });
  };

  // ── Null guard: do NOT render the section wrapper when there is no content
  // and we're not in a loading/error state — this prevents empty panels.
  if (!isLoading && !isError && listings.length === 0) {
    return null;
  }

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.07, 0.28) }}
      className="relative overflow-hidden"
      aria-label={`${category.name} listings`}
      style={{
        background: theme.gradient,
        borderTop: `1px solid rgba(${theme.accentRgb}, 0.10)`,
        borderBottom: `1px solid rgba(${theme.accentRgb}, 0.06)`,
      }}
    >
      {/* Dot-grid decorative background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, ${theme.patternColor} 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Left-edge accent line */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-2/3 rounded-full pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, transparent, ${theme.accentColor}60, transparent)`,
        }}
      />

      {/* Top-right ambient orb */}
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(${theme.accentRgb}, 0.10) 0%, transparent 70%)`,
          filter: 'blur(50px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 py-10 px-4 sm:px-6 max-w-[1400px] mx-auto">

        {/* ── Section Header ── */}
        <div className="flex items-center justify-between mb-6 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{
                background: `rgba(${theme.accentRgb}, 0.15)`,
                border: `1px solid rgba(${theme.accentRgb}, 0.25)`,
                boxShadow: `0 4px 16px rgba(${theme.accentRgb}, 0.15)`,
              }}
            >
              {theme.icon}
            </div>

            {/* Title + count */}
            <div className="min-w-0">
              <h2
                className="text-xl sm:text-2xl font-bold tracking-tight truncate"
                style={{ color: '#f0eafa' }}
              >
                {category.name}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: `rgba(${theme.accentRgb}, 0.7)` }}>
                {isLoading
                  ? 'Loading…'
                  : isError
                  ? 'Error loading'
                  : `${listings.length} listing${listings.length !== 1 ? 's' : ''} available`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Scroll controls — only when loaded with data */}
            {!isLoading && !isError && listings.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={() => scroll('left')}
                  className="w-8 h-8 rounded-full flex items-center justify-center border transition-all hover:-translate-y-0.5"
                  style={{
                    borderColor: `rgba(${theme.accentRgb}, 0.25)`,
                    background: `rgba(${theme.accentRgb}, 0.08)`,
                    color: theme.accentColor,
                  }}
                  aria-label={`Scroll ${category.name} left`}
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  onClick={() => scroll('right')}
                  className="w-8 h-8 rounded-full flex items-center justify-center border transition-all hover:-translate-y-0.5"
                  style={{
                    borderColor: `rgba(${theme.accentRgb}, 0.25)`,
                    background: `rgba(${theme.accentRgb}, 0.08)`,
                    color: theme.accentColor,
                  }}
                  aria-label={`Scroll ${category.name} right`}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            )}

            {/* View All — only when data available */}
            {!isError && (
              <Link
                href={`/listings?categoryId=${category.id}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border transition-all hover:-translate-y-0.5"
                style={{
                  color: theme.accentColor,
                  borderColor: `rgba(${theme.accentRgb}, 0.28)`,
                  background: `rgba(${theme.accentRgb}, 0.08)`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                    `0 4px 20px rgba(${theme.accentRgb}, 0.25)`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
                }}
                id={`view-all-${category.id}`}
              >
                View All
                <ArrowRight size={13} />
              </Link>
            )}
          </div>
        </div>

        {/* ── Error state ── */}
        {isError && (
          <ErrorState
            accentRgb={theme.accentRgb}
            accentColor={theme.accentColor}
            onRetry={() => refetch()}
          />
        )}

        {/* ── Slider ── */}
        {!isError && (
          <div className="relative">
            <div
              ref={sliderRef}
              className="product-slider"
              role="list"
              aria-label={`${category.name} products`}
            >
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonCard key={`sk-${i}`} accentRgb={theme.accentRgb} />
                  ))
                : listings.map((listing: Listing, i: number) => (
                    <ProductCard
                      key={listing.id}
                      listing={listing}
                      accentColor={theme.accentColor}
                      accentRgb={theme.accentRgb}
                      index={i}
                    />
                  ))}

              {/* Trailing spacer so last card doesn't butt against edge */}
              <div className="flex-shrink-0 w-2" aria-hidden />
            </div>

            {/* Right-edge fade mask */}
            <div
              className="pointer-events-none absolute right-0 top-0 h-full w-20 hidden sm:block"
              style={{
                background: `linear-gradient(to left, rgba(13,9,22,0.9), transparent)`,
              }}
            />
          </div>
        )}
      </div>
    </motion.section>
  );
}
