import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';
import { SubmissionStatus, SubmissionCategory } from '@prisma/client';
import { handleApiError } from '@/lib/api-errors';

const createSubmissionSchema = z.object({
  category: z.enum(['MY_NEWS', 'SAYING_HELLO', 'MY_SAY']),
  contentType: z.enum(['TEXT', 'IMAGE', 'AUDIO', 'DRAWING', 'MIXED']),
  textContent: z.string().max(5000).nullable().optional(),
  mediaUrl: z.string().nullable().optional(), // Allow both URLs and base64 data URIs, and null
  accessibilityText: z.string().nullable().optional(),
  drawingData: z.any().nullable().optional(),
  userName: z.string().nullable().optional(), // Optional display name for anonymous users
});

// GET /api/submissions - Get all submissions (with filters)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // Don't default - let admin see all
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100'); // Increased default limit
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: {
      status?: SubmissionStatus;
      category?: SubmissionCategory;
    } = {};

    // Only filter by status if explicitly provided
    if (status) {
      where.status = status as SubmissionStatus;
    }

    if (category) {
      where.category = category as SubmissionCategory;
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
    return handleApiError(error);
  }
}

// POST /api/submissions - Create a new submission
export async function POST(request: NextRequest) {
  // Apply rate limiting - 20 submissions per hour
  const rateLimitResponse = await rateLimit.submission(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  console.log('POST /api/submissions - Request received');
  try {
    const body = await request.json();
    console.log('Request body:', body);
    const validatedData = createSubmissionSchema.parse(body);
    
    // Get user ID from header (set by middleware) or allow anonymous
    const userId = request.headers.get('x-user-id') || null;

    console.log('Creating submission with data:', { ...validatedData, userId, status: 'PENDING' });

    const submission = await prisma.submission.create({
      data: {
        ...validatedData,
        userId,
        status: 'PENDING', // Submissions require admin review before publication
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
    
    console.log('Submission created successfully:', submission.id);

    // Log the submission creation
    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'CREATE_SUBMISSION',
          entityType: 'submission',
          entityId: submission.id,
          details: JSON.stringify({
            category: submission.category,
            contentType: submission.contentType,
          }),
        },
      });
    }

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error('Failed to create submission - Full error:', error);
    return handleApiError(error);
  }
}