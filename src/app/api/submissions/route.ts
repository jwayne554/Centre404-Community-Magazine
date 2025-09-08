import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const createSubmissionSchema = z.object({
  category: z.enum(['MY_NEWS', 'SAYING_HELLO', 'MY_SAY']),
  contentType: z.enum(['TEXT', 'IMAGE', 'AUDIO', 'DRAWING', 'MIXED']),
  textContent: z.string().max(5000).optional(),
  mediaUrl: z.string().url().optional(),
  accessibilityText: z.string().optional(),
  drawingData: z.any().optional(),
});

// GET /api/submissions - Get all submissions (with filters)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'APPROVED';
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {
      status: status as any,
    };

    if (category) {
      where.category = category;
    }

    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          submittedAt: 'desc',
        },
        take: limit,
        skip: offset,
      }),
      prisma.submission.count({ where }),
    ]);

    return NextResponse.json({
      submissions,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Failed to fetch submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// POST /api/submissions - Create a new submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = createSubmissionSchema.parse(body);
    
    // Get user ID from header (set by middleware) or allow anonymous
    const userId = request.headers.get('x-user-id') || null;

    const submission = await prisma.submission.create({
      data: {
        ...validatedData,
        userId,
        status: 'APPROVED', // Auto-approve for testing. TODO: Add proper moderation workflow
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Log the submission creation
    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'CREATE_SUBMISSION',
          entityType: 'submission',
          entityId: submission.id,
          details: {
            category: submission.category,
            contentType: submission.contentType,
          },
        },
      });
    }

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to create submission:', error);
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}