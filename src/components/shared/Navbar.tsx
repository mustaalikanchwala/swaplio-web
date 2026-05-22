'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  MessageCircle,
  Calendar,
  User,
  PlusCircle,
  LogOut,
  Menu,
  X,
  ShoppingBag,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { getToken, clearAuth, getStoredUser } from '@/lib/auth';
import { useUnreadCount } from '@/hooks/useChat';

const NAV_LINKS = [
  { href: '/', label: 'Browse', icon: BookOpen },
  { href: '/meetings', label: 'Meetings', icon: Calendar },
  { href: '/my-listings', label: 'My Listings', icon: ShoppingBag },
  { href: '/profile', label: 'Profile', icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { data: unreadCount = 0 } = useUnreadCount();

  useEffect(() => {
    setIsLoggedIn(!!getToken());
  }, [pathname]);

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const user = getStoredUser();

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div
        className="glass border-b border-[var(--border-subtle)] backdrop-blur-xl"
        style={{ borderRadius: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-lg gradient-text tracking-tight">
              Swaplio
            </span>
          </Link>

          {/* Desktop nav */}
          {isLoggedIn && (
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    pathname === href
                      ? 'bg-violet-500/15 text-violet-300'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                  )}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              ))}

              {/* Chat with unread badge */}
              <Link
                href="/chat"
                className={clsx(
                  'relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  pathname.startsWith('/chat')
                    ? 'bg-violet-500/15 text-violet-300'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                )}
              >
                <MessageCircle size={15} />
                Chat
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-pink-500 text-white text-[10px] font-bold px-1 shadow-lg shadow-pink-500/40">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            </nav>
          )}

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <Link href="/listings/create" className="btn-primary hidden sm:inline-flex">
                  <PlusCircle size={15} />
                  Sell
                </Link>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-all"
                >
                  <LogOut size={18} />
                </button>
                {/* Mobile toggle */}
                <button
                  className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-white/5"
                  onClick={() => setMobileOpen((v) => !v)}
                >
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-ghost text-sm px-4 py-2">
                  Log in
                </Link>
                <Link href="/register" className="btn-primary text-sm px-4 py-2">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && isLoggedIn && (
          <div className="md:hidden border-t border-[var(--border-subtle)] px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  pathname === href
                    ? 'bg-violet-500/15 text-violet-300'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
            <Link
              href="/chat"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
            >
              <MessageCircle size={16} />
              Chat
              {unreadCount > 0 && (
                <span className="ml-auto min-w-[20px] h-5 flex items-center justify-center rounded-full bg-pink-500 text-white text-[10px] font-bold px-1">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/listings/create"
              onClick={() => setMobileOpen(false)}
              className="btn-primary mt-2 w-full"
            >
              <PlusCircle size={15} />
              Sell something
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
