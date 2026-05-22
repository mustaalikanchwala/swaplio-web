'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useWebSocket } from '@/hooks/useWebSocket';
import { getToken } from '@/lib/auth';
import { useEffect, useState } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Inner component — needs to be inside QueryClientProvider to use hooks
function GlobalWebSocket() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  // Only connect when the user is logged in
  const hasToken = mounted ? !!getToken() : false;
  useWebSocket(hasToken ? {} : { onNotification: undefined });
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
