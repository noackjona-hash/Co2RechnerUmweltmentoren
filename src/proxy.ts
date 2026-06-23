import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('session')?.value;

  // Public routes - always accessible
  const publicPaths = ['/', '/login', '/api/auth'];
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
