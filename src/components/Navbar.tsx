import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Search, Plus, User, LogOut,
  List, Calendar, ChevronDown, Menu, X,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { getInitials } from '@/utils';
import { Button } from '@/components/ui/Button';

export const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); setDropdownOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLinks = isAuthenticated
    ? [{ to: '/', label: 'Browse' }, { to: '/search', label: 'Search' }, { to: '/meetings', label: 'Meetings' }]
    : [{ to: '/', label: 'Browse' }, { to: '/search', label: 'Search' }];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 glass-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" id="nav-logo" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-primary border border-white/10 flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all duration-300">
                <ShoppingBag size={15} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg text-gradient">Swaplio</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  id={`nav-${link.label.toLowerCase()}`}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(link.to)
                      ? 'bg-primary/20 text-primary border border-primary/30 shadow-glow-soft'
                      : 'text-muted hover:text-ink hover:bg-white/5'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/create" id="nav-create-btn" className="hidden sm:block">
                    <Button variant="primary" size="sm" leftIcon={<Plus size={14} />}>Sell</Button>
                  </Link>

                  {/* Profile dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      id="nav-profile-dropdown-btn"
                      onClick={() => setDropdownOpen((o) => !o)}
                      className="flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-1.5 rounded-xl hover:bg-primary/20 hover:border-primary/40 transition-all duration-200"
                    >
                      <div className="w-7 h-7 rounded-lg bg-primary border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                        {user?.avatar ? (
                          <img src={user.avatar} alt="" className="w-full h-full rounded-lg object-cover" />
                        ) : getInitials(user?.fullName ?? 'U')}
                      </div>
                      <span className="hidden sm:block text-sm text-ink/80 font-medium max-w-[100px] truncate">
                        {user?.fullName}
                      </span>
                      <ChevronDown
                        size={14}
                        className={`text-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-52 glass-card rounded-2xl py-2 overflow-hidden border border-white/10"
                        >
                          {[
                            { to: '/profile', label: 'Profile', icon: <User size={15} /> },
                            { to: '/my-listings', label: 'My Listings', icon: <List size={15} /> },
                            { to: '/meetings', label: 'Meetings', icon: <Calendar size={15} /> },
                          ].map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              id={`dropdown-${item.label.toLowerCase().replace(' ', '-')}`}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-ink hover:bg-card/60 transition-colors"
                            >
                              <span className="text-primary/70">{item.icon}</span>
                              {item.label}
                            </Link>
                          ))}
                          <div className="mx-4 my-1 h-px bg-white/10" />
                          <button
                            id="nav-logout-btn"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors"
                          >
                            <LogOut size={15} /> Log out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" id="nav-login-btn">
                    <Button variant="ghost" size="sm">Log in</Button>
                  </Link>
                  <Link to="/register" id="nav-register-btn">
                    <Button variant="primary" size="sm">Sign up</Button>
                  </Link>
                </div>
              )}

              <button
                id="nav-mobile-menu-btn"
                className="md:hidden p-2 rounded-xl text-muted hover:text-ink hover:bg-card/60 transition-colors"
                onClick={() => setMobileOpen((o) => !o)}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="md:hidden overflow-hidden border-t border-white/5 glass-dark"
            >
              <div className="px-4 py-3 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(link.to)
                        ? 'bg-primary/20 text-primary border border-primary/20'
                        : 'text-muted hover:text-ink hover:bg-white/5'
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAuthenticated && (
                  <Link
                    to="/create"
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all"
                  >
                    <Plus size={15} /> Sell an item
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <div className="h-16" />
    </>
  );
};
