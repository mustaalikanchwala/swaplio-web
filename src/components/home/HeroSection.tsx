'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Sparkles, ArrowRight, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const FLOATING_ITEMS = [
  { emoji: '📚', delay: 0, x: '8%', y: '20%', size: 'text-3xl' },
  { emoji: '💻', delay: 0.4, x: '80%', y: '15%', size: 'text-2xl' },
  { emoji: '🔬', delay: 0.8, x: '90%', y: '65%', size: 'text-3xl' },
  { emoji: '✏️', delay: 0.2, x: '5%', y: '72%', size: 'text-2xl' },
  { emoji: '📝', delay: 1.1, x: '60%', y: '80%', size: 'text-xl' },
  { emoji: '🎒', delay: 0.6, x: '35%', y: '8%', size: 'text-2xl' },
];

export function HeroSection() {
  const [search, setSearch] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/listings?keyword=${encodeURIComponent(search.trim())}`);
    } else {
      router.push('/listings');
    }
  };

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(139,92,246,0.15) 0%, rgba(13,9,22,0) 45%, rgba(236,72,153,0.08) 100%)',
        minHeight: '440px',
      }}
      aria-label="Hero section"
    >
      {/* Mesh grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Large ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[800px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(139,92,246,0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Floating emoji items */}
      {FLOATING_ITEMS.map((item, i) => (
        <motion.div
          key={i}
          className={`absolute pointer-events-none select-none ${item.size}`}
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -12, 0],
            rotate: [-3, 3, -3],
            opacity: [0.4, 0.65, 0.4],
          }}
          transition={{
            duration: 4 + i * 0.5,
            delay: item.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 py-20 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6"
          style={{
            background: 'rgba(139,92,246,0.1)',
            borderColor: 'rgba(139,92,246,0.3)',
            color: '#a78bfa',
          }}
        >
          <Sparkles size={13} />
          <span className="text-xs font-semibold tracking-wide">Student Marketplace</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-4"
          style={{ color: '#f0eafa' }}
        >
          Buy & Sell{' '}
          <span
            className="gradient-text"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Study Essentials
          </span>
          <br className="hidden sm:block" />
          <span className="text-[var(--text-secondary)]"> with Students Like You</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-base sm:text-lg text-[var(--text-muted)] max-w-xl mb-8"
        >
          Textbooks, lab gear, notes and more — find deals from your campus community.
        </motion.p>

        {/* Search bar */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onSubmit={handleSearch}
          className="flex w-full max-w-lg gap-2 mb-8"
          role="search"
        >
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="search"
              placeholder="Search textbooks, notes, equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10 h-12"
              id="hero-search"
              aria-label="Search listings"
            />
          </div>
          <button type="submit" className="btn-primary px-6 h-12 flex-shrink-0">
            Search
          </button>
        </motion.form>

        {/* Quick CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-3 flex-wrap justify-center"
        >
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            id="browse-all-cta"
          >
            <ShoppingBag size={15} />
            Browse all listings
            <ArrowRight size={13} />
          </Link>
          <span className="text-[var(--text-muted)] text-xs">or</span>
          <Link
            href="/listings/create"
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            id="sell-now-cta"
          >
            Sell something →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
