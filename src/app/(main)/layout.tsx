'use client';

import FloatingNav from '@/components/shared/FloatingNav';
import { AiLoadingIndicator } from '@/components/shared/AiLoadingIndicator';
import { useAiLoadingContext } from '@/context/AiLoadingContext';

function MainLayoutInner({ children }: { children: React.ReactNode }) {
  const { isAnyLoading } = useAiLoadingContext();

  return (
    <>
      <FloatingNav />
      <main className="relative z-10 min-h-screen">
        {children}
      </main>
      <AiLoadingIndicator isLoading={isAnyLoading} />
    </>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <MainLayoutInner>{children}</MainLayoutInner>;
}
