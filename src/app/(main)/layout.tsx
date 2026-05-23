'use client';

// Layout for the (main) route group.
// The homepage '/' and '/listings' are public — no auth gate here.
// Individual protected pages (profile, create, chat, etc.) use
// <ProtectedRoute> directly in their page component for granular control.

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
