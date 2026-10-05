import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { FounderSyncProvider } from '@/context/FounderSyncContext';
import { UserProfileProvider } from '@/context/UserProfileContext';
import { UserNameModal } from '@/components/common/UserNameModal';
import { GoogleCalendarModal } from '@/components/common/GoogleCalendarModal';
import { CommandPaletteModal } from '@/components/common/CommandPaletteModal';

const grotesk = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-grotesk',
  weight: ['400', '500', '600', '700', '800'],
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
    <html lang="en" className={`${grotesk.variable} font-sans`}>
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

              // Automatically purge legacy Service Workers and cached assets from other apps previously running on localhost:3000 (e.g. Nudge PWA)
              if (typeof window !== 'undefined') {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    var unregisteredAny = false;
                    for (var i = 0; i < registrations.length; i++) {
                      registrations[i].unregister();
                      unregisteredAny = true;
                    }
                    if (unregisteredAny && !sessionStorage.getItem('_sw_purged')) {
                      sessionStorage.setItem('_sw_purged', 'true');
                      window.location.reload();
                    }
                  });
                }
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    for (var i = 0; i < names.length; i++) {
                      caches.delete(names[i]);
                    }
                  });
                }
                try {
                  for (var k in localStorage) {
                    if (k && k.toLowerCase().indexOf('nudge') !== -1) {
                      localStorage.removeItem(k);
                    }
                  }
                } catch(e) {}
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#F8FAFD] text-slate-900 selection:bg-indigo-500 selection:text-white font-sans antialiased">
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
