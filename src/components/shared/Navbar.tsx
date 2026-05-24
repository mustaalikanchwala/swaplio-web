'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  MessageCircle,
  Calendar,
  User,
  LogOut,
  Menu,
  X,
  ShoppingBag,
  Home,
  ArrowRight,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { useAuth, useLogout } from '@/hooks/useAuth';
import { useUnreadCount } from '@/hooks/useChat';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/listings', label: 'Browse', icon: BookOpen },
  { href: '/meetings', label: 'Meetings', icon: Calendar },
  { href: '/my-listings', label: 'My Listings', icon: ShoppingBag },
  { href: '/profile', label: 'Profile', icon: User },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (href === '/listings') return pathname === '/listings' || (pathname.startsWith('/listings/') && !pathname.startsWith('/listings/create'));
  return pathname === href || pathname.startsWith(href + '/');
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const logout = useLogout();
  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-serif text-xl font-bold text-white tracking-wide hover:opacity-90 transition-opacity">
          Swaplio
        </Link>

        {/* Desktop nav */}
        {isAuthenticated && (
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={clsx(
                  'relative py-1 text-sm font-sans font-medium transition-colors duration-200',
                  isActive(pathname, href)
                    ? 'text-white'
                    : 'text-text-secondary hover:text-white'
                )}
              >
                {label}
                {isActive(pathname, href) && (
                  <motion.span
                    layoutId="activeDot"
                    className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                  />
                )}
              </Link>
            ))}

            {/* Chat with unread dot indicator */}
            <Link
              href="/chat"
              className={clsx(
                'relative py-1 text-sm font-sans font-medium transition-colors duration-200',
                pathname.startsWith('/chat')
                  ? 'text-white'
                  : 'text-text-secondary hover:text-white'
              )}
            >
              Chat
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
              )}
              {pathname.startsWith('/chat') && (
                <motion.span
                  layoutId="activeDot"
                  className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                />
              )}
            </Link>
          </nav>
        )}

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* User greeting */}
              {user?.fullName && (
                <span className="hidden lg:block text-xs text-text-muted max-w-[120px] truncate">
                  Hello, {user.fullName.split(' ')[0]}
                </span>
              )}

              {/* Sell button: primary CTA style (white pill, right side 40px circle with blue bg and white ArrowRight) */}
              <Link href="/listings/create" className="btn-primary hidden sm:inline-flex animate-fade-in" id="nav-sell">
                <span>Start Selling</span>
                <span className="btn-primary-circle">
                  <ArrowRight size={18} />
                </span>
              </Link>

              <button
                onClick={logout}
                title="Log out"
                className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-all animate-fade-in"
                id="nav-logout"
              >
                <LogOut size={18} />
              </button>

              {/* Mobile hamburger menu */}
              <button
                className="md:hidden p-2 rounded-lg text-text-secondary hover:bg-white/5 transition-all"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle mobile menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-ghost text-sm px-4 py-2 animate-fade-in" id="nav-login">
                Log in
              </Link>
              <Link href="/register" className="btn-primary animate-fade-in" id="nav-register">
                <span>Sign up</span>
                <span className="btn-primary-circle">
                  <ArrowRight size={18} />
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer menu */}
      <AnimatePresence>
        {mobileOpen && isAuthenticated && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden border-t border-white/5 bg-black/95 backdrop-blur-2xl px-4 py-4 flex flex-col gap-2 overflow-hidden shadow-2xl"
          >
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all',
                  isActive(pathname, href)
                    ? 'bg-accent/15 text-white'
                    : 'text-text-secondary hover:text-white hover:bg-white/5'
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            <Link
              href="/chat"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-white hover:bg-white/5"
            >
              <MessageCircle size={16} />
              Chat
              {unreadCount > 0 && (
                <span className="ml-auto min-w-[20px] h-5 flex items-center justify-center rounded-full bg-accent text-white text-[10px] font-bold px-1">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/listings/create"
              onClick={() => setMobileOpen(false)}
              className="btn-primary mt-2 w-full flex justify-between"
            >
              <span>Sell something</span>
              <span className="btn-primary-circle">
                <ArrowRight size={18} />
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
