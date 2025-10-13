import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { AuthService } from '@/lib/auth';

const registerSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(2).max(100),
  password: z.string().min(6).max(100).optional(),
  role: z.enum(['CONTRIBUTOR', 'ADMIN', 'VIEWER']).default('CONTRIBUTOR'),
});

export async function POST(request: NextRequest) {
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

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email || null,
        name: validatedData.name,
        password: hashedPassword,
        role: validatedData.role,
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

    return NextResponse.json({
      user,
      ...tokens,
    });
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