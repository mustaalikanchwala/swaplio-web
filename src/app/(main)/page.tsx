'use client';

import { HeroSection } from '@/components/home/HeroSection';
import { CategorySection } from '@/components/listings/CategorySection';
import { useCategories } from '@/hooks/useCategories';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, LayoutGrid } from 'lucide-react';

// ─── Skeleton shown while categories are loading ──────────────────────────────

function PageSkeleton() {
  return (
    <div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="py-10 px-4 sm:px-6 max-w-[1400px] mx-auto border-t border-white/5"
        >
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="skeleton w-10 h-10 rounded-xl" />
              <div className="flex flex-col gap-1.5">
                <div className="skeleton h-6 w-36 rounded-md" />
                <div className="skeleton h-3 w-24 rounded-md" />
              </div>
            </div>
            <div className="skeleton h-9 w-24 rounded-xl" />
          </div>
          {/* Cards skeleton row */}
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="flex-shrink-0 w-56 animate-pulse">
                <div className="rounded-2xl border border-bg-border bg-bg-surface overflow-hidden">
                  <div className="skeleton aspect-[4/3]" />
                  <div className="p-4 flex flex-col gap-2.5">
                    <div className="skeleton h-3.5 w-4/5 rounded-md" />
                    <div className="skeleton h-3 w-2/5 rounded-md" />
                    <div className="flex justify-between mt-1">
                      <div className="skeleton h-5 w-1/3 rounded-md" />
                      <div className="skeleton h-4 w-1/4 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Homepage ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { data: categories = [], isLoading, isError } = useCategories();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="min-h-screen bg-black"
    >
      {/* ── Hero ── */}
      <HeroSection />

      {/* ── Divider ── */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent" />

      {/* ── Section label ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-8 pb-2">
        <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-text-muted font-sans">
          <LayoutGrid size={13} />
          <span>Browse by Category</span>
        </div>
      </div>

      {/* ── Category Sections ── */}
      {isLoading && <PageSkeleton />}

      {isError && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-20 text-center">
          <p className="text-text-muted text-lg mb-2">
            Failed to load categories
          </p>
          <p className="text-text-muted text-sm">
            Please refresh the page or check your connection.
          </p>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {categories.length === 0 ? (
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-20 text-center">
              <p className="text-text-muted text-lg">No categories available yet.</p>
            </div>
          ) : (
            <div>
              {categories.map((category, index) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  index={index}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Browse All Footer CTA ── */}
      {!isLoading && !isError && categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="py-16 px-4 sm:px-6 text-center border-t border-white/5 bg-gradient-to-b from-white/[0.01] to-transparent"
        >
          <p className="text-text-muted text-sm mb-4">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-block"
          >
            <Link
              href="/listings"
              className="btn-primary"
              id="browse-all-listings-cta"
            >
              <span>Browse All Listings</span>
              <span className="btn-primary-circle">
                <ArrowRight size={16} />
              </span>
            </Link>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
