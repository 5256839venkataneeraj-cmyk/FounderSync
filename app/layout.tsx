import type { Metadata } from 'next';
import './globals.css';
import { FounderSyncProvider } from '@/context/FounderSyncContext';

export const metadata: Metadata = {
  title: 'FounderSync — Contradictory Advisor & Reality-Check Engine',
  description:
    'Human-AI collaborative dashboard breaking startup echo chambers via contradictory stress-testing and balanced human-centric sustainability signals.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
        <FounderSyncProvider>{children}</FounderSyncProvider>
      </body>
    </html>
  );
}
