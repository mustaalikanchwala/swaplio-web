'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import type { ListingImage } from '@/types';
import clsx from 'clsx';
import { motion } from 'framer-motion';

interface ImageCarouselProps {
  images: ListingImage[];
  onImageError?: () => void;
}

export function ImageCarousel({ images, onImageError }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  if (!images.length) {
    return (
      <div className="aspect-square w-full glass flex items-center justify-center border border-bg-border rounded-2xl bg-bg-surface">
        <Tag size={64} className="text-text-muted opacity-20" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 font-sans">
      {/* Main image */}
      <div className="relative overflow-hidden rounded-2xl aspect-square bg-bg-surface border border-bg-border">
        <Image
          key={images[current].id}
          src={images[current].signedUrl}
          alt={`Image ${current + 1}`}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, 50vw"
          onError={() => {
            onImageError?.();
          }}
          priority={current === 0}
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-all border border-white/5"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-all border border-white/5"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </motion.button>
          </>
        )}

        {/* Counter */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs text-text-secondary rounded-lg border border-white/5">
          {current + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setCurrent(i)}
              className={clsx(
                'relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 bg-bg-surface',
                i === current ? 'border-accent' : 'border-bg-border hover:border-white/20'
              )}
            >
              <Image
                src={img.signedUrl}
                alt={`Thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
