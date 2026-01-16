import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';
import { requireModerator } from '@/lib/api-auth';
import { SubmissionStatus, SubmissionCategory } from '@prisma/client';
import { handleApiError } from '@/lib/api-errors';
import { SubmissionService } from '@/services/submission.service';
import { SubmissionFilters } from '@/repositories/submission.repository';
import { RequestLogger } from '@/lib/api-logger';

const createSubmissionSchema = z.object({
  category: z.enum(['MY_NEWS', 'SAYING_HELLO', 'MY_SAY']),
  contentType: z.enum(['TEXT', 'IMAGE', 'AUDIO', 'DRAWING', 'MIXED']),
  textContent: z.string().max(5000).nullable().optional(),
  mediaUrl: z.string().nullable().optional(), // Allow both URLs and base64 data URIs, and null
  accessibilityText: z.string().nullable().optional(),
  drawingData: z.any().nullable().optional(),
  userName: z.string().nullable().optional(), // Optional display name for anonymous users
});

// GET /api/submissions - Get all submissions (with filters) - ADMIN/MODERATOR only
export async function GET(request: NextRequest) {
  const logger = new RequestLogger(request);

  try {
    // Require ADMIN or MODERATOR role to view submissions
    const authResult = await requireModerator(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // Don't default - let admin see all
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '100'); // Increased default limit
    const offset = parseInt(searchParams.get('offset') || '0');

    const filters: SubmissionFilters = {
      limit,
      offset,
    };

    // Only filter by status if explicitly provided
    if (status) {
      filters.status = status as SubmissionStatus;
    }

    if (category) {
      filters.category = category as SubmissionCategory;
    }

    const result = await SubmissionService.getSubmissions(filters);

    logger.success(200, {
      resultCount: result.submissions.length,
      total: result.total,
      filters: { status, category, limit, offset },
    });

    return NextResponse.json(result);
  } catch (error) {
    logger.error(error);
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

  const userId = request.headers.get('x-user-id') || undefined;
  const logger = new RequestLogger(request, { userId });

  try {
    const body = await request.json();
    const validatedData = createSubmissionSchema.parse(body);

    // Use service layer - handles transaction and audit logging
    const submission = await SubmissionService.createSubmission(validatedData, userId || null);

    logger.success(201, {
      submissionId: submission.id,
      category: submission.category,
      contentType: submission.contentType,
      isAnonymous: !userId,
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    logger.error(error, { userId });
    return handleApiError(error);
  }
}