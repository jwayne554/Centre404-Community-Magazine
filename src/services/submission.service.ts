/**
 * Submission Service - Business logic layer
 * Task 3.4: Implement Layered Architecture
 */

import prisma from '@/lib/prisma';
import {
  SubmissionRepository,
  CreateSubmissionData,
  UpdateSubmissionStatusData,
  SubmissionFilters,
  SubmissionWithUser,
} from '@/repositories/submission.repository';
import { createAuditLogInTransaction, AuditActions, EntityTypes } from '@/lib/audit-logger';
import { NotFoundError } from '@/lib/api-errors';

/**
 * Submission Service Class
 * Encapsulates business logic for submission operations
 */
export class SubmissionService {
  /**
   * Get all submissions with filters
   */
  static async getSubmissions(filters: SubmissionFilters = {}): Promise<{
    submissions: SubmissionWithUser[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const { submissions, total } = await SubmissionRepository.findMany(filters);

    return {
      submissions,
      total,
      limit: filters.limit || 100,
      offset: filters.offset || 0,
    };
  }

  /**
   * Get a submission by ID
   */
  static async getSubmissionById(id: string): Promise<SubmissionWithUser> {
    const submission = await SubmissionRepository.findById(id);

    if (!submission) {
      throw new NotFoundError('Submission not found');
    }

    return submission;
  }

  /**
   * Create a new submission
   * Includes audit logging in transaction
   */
  static async createSubmission(
    data: CreateSubmissionData,
    userId: string | null
  ): Promise<SubmissionWithUser> {
    return prisma.$transaction(async (tx) => {
      // Create submission
      const submission = await SubmissionRepository.create(
        {
          ...data,
          userId,
          status: 'PENDING',
        },
        tx
      );

      // Log the creation if user is authenticated
      if (userId) {
        await createAuditLogInTransaction(tx, {
          userId,
          action: AuditActions.CREATE_SUBMISSION,
          entityType: EntityTypes.SUBMISSION,
          entityId: submission.id,
          details: {
            category: submission.category,
            contentType: submission.contentType,
          },
        });
      }

      return submission;
    });
  }

  /**
   * Update submission status (approve/reject)
   * Includes audit logging in transaction
   */
  static async updateSubmissionStatus(
    id: string,
    status: 'APPROVED' | 'REJECTED',
    userId: string,
    reviewNotes?: string
  ): Promise<SubmissionWithUser> {
    return prisma.$transaction(async (tx) => {
      // Get current submission to check old status
      const currentSubmission = await SubmissionRepository.findById(id, tx);

      if (!currentSubmission) {
        throw new NotFoundError('Submission not found');
      }

      const oldStatus = currentSubmission.status;

      // Update submission status
      const updateData: UpdateSubmissionStatusData = {
        status,
        reviewedAt: new Date(),
        reviewedById: userId,
        reviewNotes,
      };

      const updatedSubmission = await SubmissionRepository.updateStatus(
        id,
        updateData,
        tx
      );

      // Log the status change
      await createAuditLogInTransaction(tx, {
        userId,
        action:
          status === 'APPROVED'
            ? AuditActions.APPROVE_SUBMISSION
            : AuditActions.REJECT_SUBMISSION,
        entityType: EntityTypes.SUBMISSION,
        entityId: id,
        details: {
          oldStatus,
          newStatus: status,
          reviewNotes,
        },
      });

      return updatedSubmission;
    });
  }

  /**
   * Delete a submission
   * Includes audit logging in transaction
   */
  static async deleteSubmission(
    id: string,
    userId: string
  ): Promise<void> {
    return prisma.$transaction(async (tx) => {
      // Get submission details before deletion
      const submission = await SubmissionRepository.findById(id, tx);

      if (!submission) {
        throw new NotFoundError('Submission not found');
      }

      // Delete submission
      await SubmissionRepository.delete(id, tx);

      // Log the deletion
      await createAuditLogInTransaction(tx, {
        userId,
        action: AuditActions.DELETE_SUBMISSION,
        entityType: EntityTypes.SUBMISSION,
        entityId: id,
        details: {
          category: submission.category,
          contentType: submission.contentType,
        },
      });
    });
  }

  /**
   * Get approved submissions for magazine compilation
   */
  static async getApprovedSubmissions(): Promise<SubmissionWithUser[]> {
    return SubmissionRepository.findApproved();
  }

  /**
   * Get submission statistics
   */
  static async getStatistics(): Promise<{
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  }> {
    const [pending, approved, rejected] = await Promise.all([
      SubmissionRepository.countByStatus('PENDING'),
      SubmissionRepository.countByStatus('APPROVED'),
      SubmissionRepository.countByStatus('REJECTED'),
    ]);

    return {
      pending,
      approved,
      rejected,
      total: pending + approved + rejected,
    };
  }
}
