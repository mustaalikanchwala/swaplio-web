'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface AiLoadingIndicatorProps {
  isLoading: boolean;
}

export function AiLoadingIndicator({ isLoading }: AiLoadingIndicatorProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="ai-loading"
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-bg-surface border border-bg-border backdrop-blur-md shadow-glow-sm"
          aria-live="polite"
          aria-label="AI is processing"
        >
          <Loader2 size={12} className="animate-spin text-accent shrink-0" />
          <span className="text-xs text-white/60 font-sans">AI thinking…</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
