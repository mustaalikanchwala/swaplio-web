'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Home, Search, MessageCircle, Calendar, User, ArrowRight, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUnreadCount } from '@/hooks/useChat';
import { getToken } from '@/lib/auth';

const navItems = [
  { name: 'Home', link: '/', icon: Home },
  { name: 'Browse', link: '/listings', icon: Search },
  { name: 'Chat', link: '/chat', icon: MessageCircle },
  { name: 'Meetings', link: '/meetings', icon: Calendar },
  { name: 'Profile', link: '/profile', icon: User },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (href === '/listings') return pathname === '/listings' || (pathname.startsWith('/listings/') && !pathname.startsWith('/listings/create'));
  return pathname === href || pathname.startsWith(href + '/');
}

export default function FloatingNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { data: unreadCount = 0 } = useUnreadCount();

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Prevent hydration mismatch by reading token client-side
  useEffect(() => {
    setIsLoggedIn(isAuthenticated && !!getToken());
  }, [isAuthenticated]);

  // Exclude rendering on auth and editing pages
  const hideOnPaths = ['/login', '/register'];
  const hideOnPatterns = ['/create', '/edit'];
  const shouldHide =
    hideOnPaths.includes(pathname) ||
    hideOnPatterns.some((p) => pathname.includes(p));

  if (shouldHide) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="fixed top-[16px] inset-x-0 mx-auto max-w-fit z-[5000] flex items-center justify-center px-4 md:px-0"
    >
      <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/75 backdrop-blur-xl px-2 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.link);
            return (
              <Link
                key={item.link}
                href={item.link}
                className={`relative flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 font-sans ${
                  active
                    ? 'text-white bg-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                  {item.name === 'Chat' && unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                  )}
                </div>
                <span className="hidden md:block">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-[1px] h-5 bg-white/[0.08]" />

        {/* CTA Button */}
        {isLoggedIn ? (
          <button
            onClick={() => router.push('/listings/create')}
            className="rounded-full bg-white flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-105 transition-all duration-200 p-1.5 md:pl-4 md:pr-1.5 md:py-1.5"
          >
            <span className="hidden md:block font-sans text-sm font-semibold text-[#0a0a0a]">
              Sell Now
            </span>
            <div className="w-7 h-7 bg-accent rounded-full flex items-center justify-center">
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </div>
          </button>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="rounded-full bg-white text-[#0a0a0a] flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-105 transition-all duration-200 px-4 py-2 md:px-5 md:py-2 text-sm font-semibold"
          >
            <span className="hidden md:block">Sign In</span>
            <span className="md:hidden flex items-center justify-center">
              <LogIn className="w-4 h-4" />
            </span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
