import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Vercel Proxy Mode (Manual Fetch to bypass bugged cross-origin NextResponse.rewrite POST body drops)
  // If BACKEND_URL is set, we are running on Vercel and need to proxy /api/* to the remote backend.
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
    
    try {
      // Determine if we need to pass a body (GET/HEAD requests cannot have bodies)
      const hasBody = !['GET', 'HEAD'].includes(request.method);
      const requestBody = hasBody ? await request.arrayBuffer() : undefined;

      const res = await fetch(destinationUrl, {
        method: request.method,
        headers: requestHeaders,
        body: requestBody,
        redirect: 'manual',
      });

      // Construct a new response to return to the client
      const responseHeaders = new Headers(res.headers);
      
      // Remove content encoding and length because fetch automatically decompresses the body
      responseHeaders.delete('content-encoding');
      responseHeaders.delete('content-length');
      
      // Return the proxied response content
      const resBody = await res.arrayBuffer();
      return new NextResponse(resBody, {
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
      });
    } catch (error: any) {
      console.error('Vercel API Proxy error:', error);
      return NextResponse.json(
        { error: 'Vercel API Proxy failed: ' + error.message },
        { status: 502 }
      );
    }
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
