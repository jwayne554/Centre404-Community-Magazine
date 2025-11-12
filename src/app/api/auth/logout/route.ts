import { NextRequest, NextResponse } from 'next/server';

export async function POST(_request: NextRequest) {
  // Create response
  const response = NextResponse.json({
    message: 'Logged out successfully',
  });

  // Clear authentication cookies
  response.cookies.set('accessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // Expire immediately
    path: '/',
  });

  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0, // Expire immediately
    path: '/api/auth',
  });

  return response;
}
