import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { AuthService } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';

const registerSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2).max(100),
  password: z.string().min(6).max(100).optional(),
  // Note: role is NOT accepted from user input - always defaults to CONTRIBUTOR
  // Admin/Moderator roles must be assigned manually in database or by existing admin
});

export async function POST(request: NextRequest) {
  // Apply rate limiting - 3 registrations per hour
  const rateLimitResponse = await rateLimit.register(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user with email already exists (if email provided)
    if (validatedData.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        );
      }
    }

    // Hash password if provided
    let hashedPassword = null;
    if (validatedData.password) {
      hashedPassword = await AuthService.hashPassword(validatedData.password);
    }

    // Create user - always as CONTRIBUTOR (security: prevent role escalation)
    const user = await prisma.user.create({
      data: {
        email: validatedData.email || null,
        name: validatedData.name,
        password: hashedPassword,
        role: 'CONTRIBUTOR',  // Hardcoded - users cannot self-assign elevated roles
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = AuthService.generateTokens(user);

    // Create response with user data only (no tokens in JSON)
    const response = NextResponse.json({ user });

    // Set tokens in HTTP-only cookies for XSS protection
    response.cookies.set('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    response.cookies.set('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
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

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}