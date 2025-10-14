import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export function middleware(request: NextRequest) {
  // NOTE: Authentication temporarily disabled for admin access
  // TODO: Implement proper authentication flow with login page

  // Define protected routes (currently not enforced)
  const protectedPaths = ['/api/admin'];
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const payload = AuthService.verifyAccessToken(token);

      // Add user info to headers for API routes
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-role', payload.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch {
      if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/admin/:path*',
  ],
};