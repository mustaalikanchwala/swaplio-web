'use client';

// ─────────────────────────────────────────────────────────────────────────────
// ProtectedRoute — wraps any page that requires authentication.
//
// While auth is restoring (isLoading=true) → shows a full-screen spinner.
// If unauthenticated → redirects to /login.
// If authenticated → renders children.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // While restoring session — show spinner (prevents flash of protected content)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <Loader2 size={24} className="animate-spin text-violet-400" />
        </div>
      </div>
    );
  }

  // Not authenticated — redirect is in flight, render nothing
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
