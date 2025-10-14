import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

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

    // TODO: Re-enable authentication when login system is implemented
    // const userRole = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id') || null;

    // Temporarily allow all requests (authentication disabled)
    // if (userRole !== 'ADMIN') {
    //   return NextResponse.json(
    //     { error: 'Unauthorized - Admin access required' },
    //     { status: 403 }
    //   );
    // }

    const body = await request.json();
    const validatedData = updateStatusSchema.parse(body);

    // Get current status before update
    const currentSubmission = await prisma.submission.findUnique({
      where: { id },
      select: { status: true },
    });

    // Update submission
    const submission = await prisma.submission.update({
      where: { id },
      data: {
        status: validatedData.status,
        reviewNotes: validatedData.reviewNotes,
        reviewedAt: new Date(),
        reviewedById: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Log the action (userId can be null for anonymous admin actions)
    await prisma.auditLog.create({
      data: {
        userId: userId,  // null is valid for anonymous actions
        action: `UPDATE_SUBMISSION_STATUS_${validatedData.status}`,
        entityType: 'submission',
        entityId: id,
        details: JSON.stringify({
          previousStatus: currentSubmission?.status || 'UNKNOWN',
          newStatus: validatedData.status,
          reviewNotes: validatedData.reviewNotes,
        }),
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Failed to update submission status:', error);
    return NextResponse.json(
      { error: 'Failed to update submission status' },
      { status: 500 }
    );
  }
}