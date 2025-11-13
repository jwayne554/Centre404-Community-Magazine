import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { AuthService } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  // Apply rate limiting - 5 login attempts per minute
  const rateLimitResponse = await rateLimit.auth(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await AuthService.verifyPassword(
      validatedData.password,
      user.password
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate tokens
    const tokens = AuthService.generateTokens(user);

    // Create response with user data only (no tokens in JSON)
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    // Set tokens in HTTP-only cookies for XSS protection
    response.cookies.set('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    // Set refresh token with extended expiry if "remember me" is enabled
    const refreshTokenMaxAge = validatedData.rememberMe
      ? 30 * 24 * 60 * 60 // 30 days if remember me
      : 7 * 24 * 60 * 60; // 7 days default

    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: refreshTokenMaxAge,
      path: '/api/auth',
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}