/**
 * Submission Repository - Database access layer
 * Task 3.4: Implement Layered Architecture
 */

import prisma from '@/lib/prisma';
import { Prisma, Submission, SubmissionStatus, SubmissionCategory } from '@prisma/client';

/**
 * Submission with user relation
 */
export type SubmissionWithUser = Prisma.SubmissionGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

/**
 * Filters for querying submissions
 */
export interface SubmissionFilters {
  status?: SubmissionStatus;
  category?: SubmissionCategory;
  userId?: string;
  limit?: number;
  offset?: number;
}

/**
 * Data for creating a submission
 */
export interface CreateSubmissionData {
  category: SubmissionCategory;
  contentType: Prisma.SubmissionCreateInput['contentType'];
  textContent?: string | null;
  mediaUrl?: string | null;
  accessibilityText?: string | null;
  drawingData?: Prisma.InputJsonValue | null;
  userName?: string | null;
  userId?: string | null;
  status?: SubmissionStatus;
}

/**
 * Data for updating submission status
 */
export interface UpdateSubmissionStatusData {
  status: SubmissionStatus;
  reviewedAt?: Date;
  reviewedById?: string | null;
  reviewNotes?: string | null;
}

/**
 * Submission Repository Class
 * Encapsulates all database operations for submissions
 */
export class SubmissionRepository {
  /**
   * Find many submissions with filters
   */
  static async findMany(
    filters: SubmissionFilters = {},
    tx?: Prisma.TransactionClient
  ): Promise<{ submissions: SubmissionWithUser[]; total: number }> {
    const client = tx || prisma;

    const where: Prisma.SubmissionWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;
    if (filters.userId) where.userId = filters.userId;

    const [submissions, total] = await Promise.all([
      client.submission.findMany({
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
        take: filters.limit || 100,
        skip: filters.offset || 0,
      }),
      client.submission.count({ where }),
    ]);

    return { submissions, total };
  }

  /**
   * Find a submission by ID
   */
  static async findById(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<SubmissionWithUser | null> {
    const client = tx || prisma;

    return client.submission.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Create a new submission
   */
  static async create(
    data: CreateSubmissionData,
    tx?: Prisma.TransactionClient
  ): Promise<SubmissionWithUser> {
    const client = tx || prisma;

    return client.submission.create({
      data: {
        category: data.category,
        contentType: data.contentType,
        textContent: data.textContent,
        mediaUrl: data.mediaUrl,
        accessibilityText: data.accessibilityText,
        drawingData: data.drawingData as Prisma.InputJsonValue,
        userName: data.userName,
        userId: data.userId,
        status: data.status || 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }) as unknown as Promise<SubmissionWithUser>;
  }

  /**
   * Update submission status (approve/reject)
   */
  static async updateStatus(
    id: string,
    data: UpdateSubmissionStatusData,
    tx?: Prisma.TransactionClient
  ): Promise<SubmissionWithUser> {
    const client = tx || prisma;

    return client.submission.update({
      where: { id },
      data: {
        status: data.status,
        reviewedAt: data.reviewedAt,
        reviewedById: data.reviewedById,
        reviewNotes: data.reviewNotes,
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
  }

  /**
   * Delete a submission
   */
  static async delete(id: string, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || prisma;
    await client.submission.delete({ where: { id } });
  }

  /**
   * Count submissions by status
   */
  static async countByStatus(
    status: SubmissionStatus,
    tx?: Prisma.TransactionClient
  ): Promise<number> {
    const client = tx || prisma;
    return client.submission.count({ where: { status } });
  }

  /**
   * Find approved submissions for magazine compilation
   */
  static async findApproved(
    tx?: Prisma.TransactionClient
  ): Promise<SubmissionWithUser[]> {
    const client = tx || prisma;

    return client.submission.findMany({
      where: {
        status: 'APPROVED',
      },
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
    });
  }
}
