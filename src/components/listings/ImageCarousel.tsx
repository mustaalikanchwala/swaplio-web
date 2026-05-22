'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import type { ListingImage } from '@/types';
import clsx from 'clsx';

interface ImageCarouselProps {
  images: ListingImage[];
  onImageError?: () => void; // triggers refetch of signed URLs
}

export function ImageCarousel({ images, onImageError }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  if (!images.length) {
    return (
      <div className="aspect-square w-full glass flex items-center justify-center">
        <Tag size={64} className="text-[var(--text-muted)] opacity-20" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl aspect-square bg-[var(--bg-secondary)]">
      {/* Main image */}
      <Image
        key={images[current].id}
        src={images[current].signedUrl}
        alt={`Image ${current + 1}`}
        fill
        className="object-cover transition-opacity duration-300"
        sizes="(max-width: 768px) 100vw, 50vw"
        onError={() => {
          // Signed signedUrlexpired — trigger parent refetch
          onImageError?.();
        }}
        priority={current === 0}
      />

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full glass text-[var(--text-primary)] hover:bg-white/20 transition-all"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full glass text-[var(--text-primary)] hover:bg-white/20 transition-all"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={clsx(
                  'rounded-full transition-all',
                  i === current
                    ? 'w-5 h-2 bg-violet-400'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                )}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Counter */}
      <div className="absolute top-3 right-3 glass px-2 py-1 text-xs text-[var(--text-secondary)] rounded-lg">
        {current + 1} / {images.length}
      </div>
    </div>
  );
}
