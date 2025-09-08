import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED']),
  reviewNotes: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin (from middleware)
    const userRole = request.headers.get('x-user-role');
    const userId = request.headers.get('x-user-id');
    
    if (userRole !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateStatusSchema.parse(body);

    // Update submission
    const submission = await prisma.submission.update({
      where: { id: params.id },
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

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: userId!,
        action: `UPDATE_SUBMISSION_STATUS_${validatedData.status}`,
        entityType: 'submission',
        entityId: params.id,
        details: {
          previousStatus: submission.status,
          newStatus: validatedData.status,
          reviewNotes: validatedData.reviewNotes,
        },
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
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