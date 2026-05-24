import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/shared/Providers';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Swaplio — Student Marketplace',
  description:
    'Buy and sell second-hand textbooks, notes, lab equipment and more on Swaplio — the marketplace built for students.',
  keywords: ['student marketplace', 'textbooks', 'second-hand', 'study materials'],
  openGraph: {
    title: 'Swaplio — Student Marketplace',
    description: 'Buy and sell second-hand study materials.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Providers>
          {/* Ambient background orbs */}
          <div className="orb orb-1" />
          <div className="orb orb-2" />

          {children}
        </Providers>
      </body>
    </html>
  );
}

