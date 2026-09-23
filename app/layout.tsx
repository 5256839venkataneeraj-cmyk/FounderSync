import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { FounderSyncProvider } from '@/context/FounderSyncContext';
import { UserProfileProvider } from '@/context/UserProfileContext';
import { UserNameModal } from '@/components/common/UserNameModal';
import { GoogleCalendarModal } from '@/components/common/GoogleCalendarModal';
import { CommandPaletteModal } from '@/components/common/CommandPaletteModal';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'FounderSync — Contradictory Advisor & Reality-Check Engine',
  description:
    'Human-AI collaborative dashboard breaking startup echo chambers via contradictory stress-testing and balanced human-centric sustainability signals.',
  icons: {
    icon: '/logo-mark.png',
    shortcut: '/logo-mark.png',
    apple: '/logo-mark.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${inter.className} font-sans`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Auto-recover from stale Webpack HMR chunk loading errors on server restart
              window.addEventListener('error', function(e) {
                var msg = (e && (e.message || (e.error && e.error.message))) || '';
                if (msg.indexOf('ChunkLoadError') !== -1 || msg.indexOf('Loading chunk') !== -1) {
                  var storageKey = '_last_chunk_reload';
                  var lastReload = parseInt(sessionStorage.getItem(storageKey) || '0', 10);
                  var now = Date.now();
                  if (now - lastReload > 3000) {
                    sessionStorage.setItem(storageKey, String(now));
                    window.location.reload();
                  }
                }
              });
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
        <AuthProvider>
          <UserProfileProvider>
            <FounderSyncProvider>
              {children}
              <UserNameModal />
              <GoogleCalendarModal />
              <CommandPaletteModal />
            </FounderSyncProvider>
          </UserProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
