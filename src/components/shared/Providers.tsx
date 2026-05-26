'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useWebSocket } from '@/hooks/useWebSocket';
import { AiLoadingProvider } from '@/context/AiLoadingContext';

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
            background: '#0a0a0a',
            color: '#ffffff',
            border: '1px solid #1a1a1a',
            borderRadius: '12px',
            fontFamily: 'Instrument Sans, sans-serif',
            fontSize: '14px',
          },
          success: {
            style: {
              borderLeft: '4px solid #22c55e',
              background: '#0a0a0a',
              color: '#ffffff',
              borderTop: '1px solid #1a1a1a',
              borderRight: '1px solid #1a1a1a',
              borderBottom: '1px solid #1a1a1a',
            },
          },
          error: {
            style: {
              borderLeft: '4px solid #ef4444',
              background: '#0a0a0a',
              color: '#ffffff',
              borderTop: '1px solid #1a1a1a',
              borderRight: '1px solid #1a1a1a',
              borderBottom: '1px solid #1a1a1a',
            },
          },
        }}
      />
    </AuthProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AiLoadingProvider>
        <AppProviders>{children}</AppProviders>
      </AiLoadingProvider>
    </QueryClientProvider>
  );
}
