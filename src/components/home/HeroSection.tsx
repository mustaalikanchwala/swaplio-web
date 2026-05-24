'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

const videoSrc = "https://stream.mux.com/T6oQJQ02cQ6N01TR6iHwZkKFkbepS34dkkIc9iukgy400g.m3u8";
const posterUrl = "https://images.unsplash.com/photo-1647356191320-d7a1f80ca777?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGRhcmslMjB0ZWNobm9sb2d5JTIwbmV1cmFsJTIwbmV0d29ya3xlbnwxfHx8fDE3Njg5NzIyNTV8MA&ixlib=rb-4.1.0&q=80&w=1080";

export function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((e) => console.log("Autoplay prevented:", e));
      });
      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Safari native HLS support
      video.src = videoSrc;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch((e) => console.log("Autoplay prevented:", e));
      });
    }
  }, []);

  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black"
      aria-label="Hero section"
    >
      {/* Layer 1 — the video itself */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-60 z-0"
        muted
        loop
        playsInline
        poster={posterUrl}
      />

      {/* Layer 2 — dark overlay on top of the video */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10" />

      {/* Mesh grid background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 z-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Decorative gradient orbs */}
      <div
        className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] rounded-full pointer-events-none mix-blend-screen opacity-70 z-10"
        style={{
          background: 'radial-gradient(circle, rgba(30, 58, 138, 0.25) 0%, transparent 70%)',
          filter: 'blur(120px)',
        }}
      />
      <div
        className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full pointer-events-none mix-blend-screen opacity-70 z-10"
        style={{
          background: 'radial-gradient(circle, rgba(49, 46, 129, 0.25) 0%, transparent 70%)',
          filter: 'blur(120px)',
        }}
      />

      {/* Content Container */}
      <div className="relative z-20 max-w-5xl mx-auto text-center mt-32 px-6 flex flex-col items-center space-y-8">
        
        {/* Pre-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="font-serif text-3xl sm:text-5xl lg:text-[48px] text-white leading-tight"
        >
          Find. Negotiate. Exchange.
        </motion.p>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          className="font-sans font-semibold text-6xl sm:text-8xl lg:text-[110px] leading-[0.9] tracking-tighter bg-gradient-to-b from-white via-white to-[#b4c0ff] bg-clip-text text-transparent"
        >
          Student
          <br />
          Marketplace
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          className="font-sans text-lg sm:text-xl text-white max-w-xl mx-auto"
        >
          Buy and sell textbooks, notes, and study materials with students from your college.
        </motion.p>

        {/* CTA buttons row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto pt-4"
        >
          {/* Primary CTA */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="w-full sm:w-auto"
          >
            <Link
              href="/listings/create"
              className="btn-primary w-full sm:w-auto"
              id="hero-sell-free"
            >
              <span>Start Selling Free</span>
              <span className="btn-primary-circle">
                <ArrowRight size={20} />
              </span>
            </Link>
          </motion.div>

          {/* Secondary CTA */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="w-full sm:w-auto"
          >
            <Link
              href="/listings"
              className="btn-ghost w-full sm:w-auto flex items-center justify-center gap-2 group px-6"
              id="hero-browse"
            >
              <span>Browse Listings</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
