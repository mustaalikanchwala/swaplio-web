'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import type { CategoryTheme } from '@/lib/categoryThemes';

interface BackgroundSectionProps {
  theme: CategoryTheme;
  children: React.ReactNode;
  index?: number; // for staggered entry animation
}

export function BackgroundSection({ theme, children, index = 0 }: BackgroundSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{
        duration: 0.65,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(index * 0.08, 0.3),
      }}
      className="relative overflow-hidden"
      style={{
        background: theme.gradient,
        borderTop: `1px solid rgba(${theme.accentRgb}, 0.12)`,
        borderBottom: `1px solid rgba(${theme.accentRgb}, 0.08)`,
      }}
    >
      {/* Dot-grid decorative pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, ${theme.patternColor} 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {/* Left edge glow */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3/4 rounded-full opacity-60 pointer-events-none"
        style={{
          background: `linear-gradient(to bottom, transparent, ${theme.accentColor}, transparent)`,
          filter: 'blur(8px)',
        }}
      />

      {/* Top-right ambient orb */}
      <div
        className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, rgba(${theme.accentRgb}, 0.12) 0%, transparent 70%)`,
          filter: 'blur(40px)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 py-12 px-4 sm:px-6 max-w-[1400px] mx-auto">
        {children}
      </div>
    </motion.section>
  );
}
