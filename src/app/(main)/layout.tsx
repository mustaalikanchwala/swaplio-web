import FloatingNav from '@/components/shared/FloatingNav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FloatingNav />
      <main className="relative z-10 min-h-screen">
        {children}
      </main>
    </>
  );
}


