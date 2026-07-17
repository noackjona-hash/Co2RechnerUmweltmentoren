import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Vercel Rewrite Proxy Mode
  // If BACKEND_URL is set, we are running on Vercel and need to rewrite /api/* to the remote backend.
  const backendUrl = process.env.BACKEND_URL;
  const backendSecret = process.env.BACKEND_SECRET_KEY;

  if (pathname.startsWith('/api/') && backendUrl) {
    const requestHeaders = new Headers(request.headers);
    
    // Add ngrok skip header to bypass the browser warning page
    requestHeaders.set('ngrok-skip-browser-warning', 'true');
    
    // Add secret key header to authenticate against the backend
    if (backendSecret) {
      requestHeaders.set('x-backend-secret-key', backendSecret);
    }

    // Build external destination URL (preserving path and query parameters)
    const destinationUrl = new URL(pathname + request.nextUrl.search, backendUrl);
    
    return NextResponse.rewrite(destinationUrl, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 2. Local Backend Protection Mode
  // If BACKEND_SECRET_KEY is set on the remote backend, verify that incoming API requests
  // coming via public tunnels have the correct secret key (meaning they came via Vercel).
  const localSecret = process.env.BACKEND_SECRET_KEY;
  const host = request.headers.get('host') || '';
  const isPublicTunnel = host.includes('ngrok-free.dev') || host.includes('lhr.life');

  if (pathname.startsWith('/api/') && localSecret && !backendUrl && isPublicTunnel) {
    const incomingSecret = request.headers.get('x-backend-secret-key');
    if (incomingSecret !== localSecret) {
      return NextResponse.json(
        { error: 'Access denied. Direct access to this API is not allowed.' },
        { status: 403 }
      );
    }
  }

  // 3. Original Access Control Checks
  const token = request.cookies.get('session')?.value;

  // Public routes - always accessible
  const publicPaths = ['/', '/login', '/api/auth', '/api/stats'];
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return NextResponse.next();
  }

  // Check authentication
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('session');
    return response;
  }

  // Role-based access control
  if (pathname.startsWith('/admin')) {
    if (payload.role !== 'super-admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname.startsWith('/school')) {
    if (payload.role !== 'school-admin') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname.startsWith('/quiz') || pathname.startsWith('/results')) {
    if (payload.role !== 'student') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // API route protection
  if (pathname.startsWith('/api/admin') && payload.role !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  if (pathname.startsWith('/api/school') && payload.role !== 'school-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  if (pathname.startsWith('/api/quiz') && payload.role !== 'student') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
