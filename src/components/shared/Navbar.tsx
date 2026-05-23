'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Home,
} from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { useAuth, useLogout } from '@/hooks/useAuth';
import { useUnreadCount } from '@/hooks/useChat';

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
    <header className="fixed top-0 inset-x-0 z-50">
      <div
        className="glass border-b border-[var(--border-subtle)] backdrop-blur-xl"
        style={{ borderRadius: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-shadow">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-lg gradient-text tracking-tight">Swaplio</span>
          </Link>

          {/* Desktop nav */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={clsx(
                    'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                    isActive(pathname, href)
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
            {isAuthenticated ? (
              <>
                {/* User greeting */}
                {user?.fullName && (
                  <span className="hidden lg:block text-xs text-[var(--text-muted)] max-w-[120px] truncate">
                    {user.fullName.split(' ')[0]}
                  </span>
                )}

                <Link href="/listings/create" className="btn-primary hidden sm:inline-flex" id="nav-sell">
                  <PlusCircle size={15} />
                  Sell
                </Link>
                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-all"
                  id="nav-logout"
                >
                  <LogOut size={18} />
                </button>
                {/* Mobile toggle */}
                <button
                  className="md:hidden p-2 rounded-lg text-[var(--text-secondary)] hover:bg-white/5"
                  onClick={() => setMobileOpen((v) => !v)}
                  aria-label="Toggle mobile menu"
                >
                  {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-ghost text-sm px-4 py-2" id="nav-login">
                  Log in
                </Link>
                <Link href="/register" className="btn-primary text-sm px-4 py-2" id="nav-register">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && isAuthenticated && (
          <div className="md:hidden border-t border-[var(--border-subtle)] px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                  isActive(pathname, href)
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
