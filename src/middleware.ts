import { NextRequest, NextResponse } from 'next/server';

// NOTE: Middleware runs in Edge runtime which doesn't support jsonwebtoken
// Authentication is handled directly in route handlers using src/lib/api-auth.ts
// This middleware only runs for non-API routes (admin UI, etc.)

export function middleware(_request: NextRequest) {
  // For now, just pass through all requests
  // Authentication is handled in individual API routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only match paths that aren't API routes or static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};