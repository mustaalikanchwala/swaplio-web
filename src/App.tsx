import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from '@/components/Navbar';
import { ProtectedRoute } from '@/components/ui/ProtectedRoute';
import { useCategoryStore } from '@/store/categoryStore';

const HomePage         = lazy(() => import('@/pages/HomePage'));
const LoginPage        = lazy(() => import('@/pages/LoginPage'));
const RegisterPage     = lazy(() => import('@/pages/RegisterPage'));
const ListingDetailPage= lazy(() => import('@/pages/ListingDetailPage'));
const SearchPage       = lazy(() => import('@/pages/SearchPage'));
const CreateListingPage= lazy(() => import('@/pages/CreateListingPage'));
const EditListingPage  = lazy(() => import('@/pages/EditListingPage'));
const ProfilePage      = lazy(() => import('@/pages/ProfilePage'));
const MyListingsPage   = lazy(() => import('@/pages/MyListingsPage'));
const MeetingsPage     = lazy(() => import('@/pages/MeetingsPage'));

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-2xl bg-card border border-primary/20 flex items-center justify-center shadow-glow animate-pulse-soft">
        <div className="w-6 h-6 border-[3px] border-ink/20 border-t-primary rounded-full animate-spin" />
      </div>
      <p className="text-muted text-sm tracking-wide font-medium">Loading…</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const { fetchCategories } = useCategoryStore();

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-app-gradient grain text-ink selection:bg-primary/30">

        {/* Decorative background blobs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[100px] animate-blob" style={{ animationDelay: '0s' }} />
          <div className="absolute top-1/2 -left-56 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px] animate-blob" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-40 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[90px] animate-blob" style={{ animationDelay: '4s' }} />
        </div>

        <Navbar />

        <main className="relative z-10">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/"            element={<HomePage />} />
              <Route path="/login"       element={<LoginPage />} />
              <Route path="/register"    element={<RegisterPage />} />
              <Route path="/listings/:id" element={<ListingDetailPage />} />
              <Route path="/search"      element={<SearchPage />} />

              <Route path="/create"      element={<ProtectedRoute><CreateListingPage /></ProtectedRoute>} />
              <Route path="/edit/:id"    element={<ProtectedRoute><EditListingPage /></ProtectedRoute>} />
              <Route path="/profile"     element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/my-listings" element={<ProtectedRoute><MyListingsPage /></ProtectedRoute>} />
              <Route path="/meetings"    element={<ProtectedRoute><MeetingsPage /></ProtectedRoute>} />

              <Route path="*" element={
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                  <h2 className="text-8xl font-display font-bold text-gradient mb-6 tracking-tighter">404</h2>
                  <p className="text-muted text-lg mb-8">This page doesn't exist.</p>
                  <a href="/" className="px-6 py-2.5 rounded-full bg-card border border-primary/20 text-ink hover:bg-primary/10 hover:border-primary/40 transition-smooth">
                    ← Go back home
                  </a>
                </div>
              } />
            </Routes>
          </Suspense>
        </main>

        <Toaster
          position="top-right"
          toastOptions={{
            className: 'toast-custom',
            duration: 4000,
            style: {
              background: '#111111',
              color: '#f8fafc',
              border: '1px solid rgba(139,92,246,0.25)',
              borderRadius: '16px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.60)',
            },
          }}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;
