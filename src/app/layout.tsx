import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Naming Lab — SaaS Naming Research',
  description: 'Generate, organize, score and refine brand names for your SaaS company.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {/* Desktop: offset for sidebar */}
        <main className="md:ml-56 min-h-screen">
          {/* Mobile: offset for top bar and bottom nav */}
          <div className="pt-14 pb-20 md:pt-0 md:pb-0">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
