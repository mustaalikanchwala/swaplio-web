import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import type { ListingImage } from '@/types';

interface ImageCarouselProps { images: ListingImage[]; title?: string; }

export const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, title }) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);

  const goTo = useCallback((index: number, dir: number) => {
    setDirection(dir);
    setCurrent((index + images.length) % images.length);
  }, [images.length]);

  const prev = () => goTo(current - 1, -1);
  const next = () => goTo(current + 1, 1);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-video bg-secondary rounded-3xl flex items-center justify-center text-accent/20 border border-accent/10">
        <svg width="64" height="64" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeWidth="1.5"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const variants = {
    enter:  (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <div className="relative group">
      <div className="relative overflow-hidden rounded-3xl bg-secondary border border-accent/10 aspect-video">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            src={images[current].signedUrl}
            alt={title ?? `Image ${current + 1}`}
            loading="lazy"
            className="w-full h-full object-cover cursor-zoom-in"
            onClick={() => setZoomOpen(true)}
          />
        </AnimatePresence>

        {/* Zoom hint */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="glass px-2 py-1.5 rounded-xl text-muted">
            <ZoomIn size={15} />
          </div>
        </div>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button id="carousel-prev-btn" onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 glass p-2.5 rounded-xl text-muted hover:text-ink opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
              <ChevronLeft size={20} />
            </button>
            <button id="carousel-next-btn" onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 glass p-2.5 rounded-xl text-muted hover:text-ink opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button key={i} id={`carousel-dot-${i}`} onClick={() => goTo(i, i > current ? 1 : -1)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 bg-accent' : 'w-1.5 bg-accent/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button key={img.id} id={`carousel-thumb-${i}`} onClick={() => goTo(i, i > current ? 1 : -1)}
              className={`flex-shrink-0 w-16 h-12 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                i === current ? 'border-accent shadow-glow scale-105' : 'border-accent/15 hover:border-accent/40'
              }`}>
              <img src={img.signedUrl} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {zoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-lg"
            onClick={() => setZoomOpen(false)}
          >
            <motion.img
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.85 }}
              src={images[current].signedUrl}
              alt=""
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
