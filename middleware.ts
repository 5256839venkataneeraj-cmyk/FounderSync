import { NextResponse, type NextRequest } from 'next/server';

// Paths that never require authentication
const PUBLIC_PATHS = [
  '/login',
  '/auth',
  '/contact',
  '/concierge',
  '/faq',
  '/templates',
  '/robots.txt',
  '/favicon.png',
  '/favicon.ico',
];

export function middleware(req: any) {
  const { pathname } = req.nextUrl;

  // 1. Allow public static assets and internal Next.js build files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ||
    /\.(png|jpg|jpeg|gif|svg|ico|pdf|txt|css|js|woff|woff2)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 2. Check for Supabase authentication tokens in cookies
  const cookies = req.cookies;
  const hasAuthToken =
    cookies.has('sb-access-token') ||
    cookies.has('supabase-auth-token') ||
    Array.from(cookies.getAll()).some(
      (c: any) =>
        c.name.includes('auth-token') ||
        c.name.startsWith('sb-') ||
        c.name === 'supabase.auth.token'
    );

  // In development, allow localhost access for developer workflows
  const isDev = process.env.NODE_ENV === 'development';
  const isLocalhost = req.headers.get('host')?.includes('localhost') || req.headers.get('host')?.includes('127.0.0.1');

  // If unauthenticated in production, or in dev without local host header, redirect to /login
  if (!hasAuthToken && !isDev) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Inject strict security headers on response
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, favicon.png (favicon files)
     * - images and fonts
     */
    '/((?!_next/static|_next/image|favicon.ico|favicon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
