'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useWebSocket } from '@/hooks/useWebSocket';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Connects WebSocket only when the user is fully authenticated.
// Lives inside AuthProvider so it can read isAuthenticated reactively.
function GlobalWebSocket() {
  const { isAuthenticated } = useAuth();
  // Only mount the STOMP connection when authenticated
  useWebSocket(isAuthenticated ? {} : { onNotification: undefined });
  return null;
}

// Inner layer: needs QueryClientProvider AND AuthProvider in scope
function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <GlobalWebSocket />
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(20, 14, 30, 0.95)',
            color: '#e2d9f3',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            backdropFilter: 'blur(12px)',
          },
        }}
      />
    </AuthProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProviders>{children}</AppProviders>
    </QueryClientProvider>
  );
}
