import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireModerator } from '@/lib/api-auth';
import { handleApiError, ValidationError } from '@/lib/api-errors';
import { SubmissionService } from '@/services/submission.service';

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED']),
  reviewNotes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Require ADMIN or MODERATOR role
    const authResult = await requireModerator(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { userId } = authResult.auth;

    const body = await request.json();
    const validatedData = updateStatusSchema.parse(body);

    // Only support APPROVED and REJECTED for now
    // (PENDING and ARCHIVED would need additional logic)
    if (validatedData.status !== 'APPROVED' && validatedData.status !== 'REJECTED') {
      throw new ValidationError(
        'Only APPROVED and REJECTED statuses are supported',
        { supportedStatuses: ['APPROVED', 'REJECTED'] }
      );
    }

    // Use service layer - handles transaction and audit logging
    const submission = await SubmissionService.updateSubmissionStatus(
      id,
      validatedData.status,
      userId,
      validatedData.reviewNotes
    );

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Failed to update submission status:', error);
    return handleApiError(error);
  }
}