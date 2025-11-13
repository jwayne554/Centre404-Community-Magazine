/**
 * Magazine Service - Business logic layer
 * Task 3.4: Implement Layered Architecture
 */

import prisma from '@/lib/prisma';
import {
  MagazineRepository,
  CreateMagazineData,
  MagazineFilters,
  MagazineWithRelations,
} from '@/repositories/magazine.repository';
import { createAuditLogInTransaction, AuditActions, EntityTypes } from '@/lib/audit-logger';
import { NotFoundError, ValidationError } from '@/lib/api-errors';

/**
 * Input for creating a magazine
 */
export interface CreateMagazineInput {
  title: string;
  description?: string;
  submissionIds: string[];
  isPublic: boolean;
}

/**
 * Magazine Service Class
 * Encapsulates business logic for magazine operations
 */
export class MagazineService {
  /**
   * Get all magazines with filters
   */
  static async getMagazines(filters: MagazineFilters = {}): Promise<MagazineWithRelations[]> {
    return MagazineRepository.findMany(filters);
  }

  /**
   * Get a magazine by ID
   */
  static async getMagazineById(id: string): Promise<MagazineWithRelations> {
    const magazine = await MagazineRepository.findById(id);

    if (!magazine) {
      throw new NotFoundError('Magazine not found');
    }

    return magazine;
  }

  /**
   * Get a magazine by slug
   */
  static async getMagazineBySlug(slug: string): Promise<MagazineWithRelations> {
    const magazine = await MagazineRepository.findBySlug(slug);

    if (!magazine) {
      throw new NotFoundError('Magazine not found');
    }

    return magazine;
  }

  /**
   * Create a new magazine
   * Includes audit logging in transaction
   */
  static async createMagazine(
    input: CreateMagazineInput,
    userId: string
  ): Promise<MagazineWithRelations> {
    // Validate that we have submissions
    if (!input.submissionIds || input.submissionIds.length === 0) {
      throw new ValidationError('At least one submission is required');
    }

    return prisma.$transaction(async (tx) => {
      // Generate unique slug
      const slug = `${input.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

      // Prepare magazine data
      const magazineData: CreateMagazineData = {
        title: input.title,
        description: input.description,
        version: `v${new Date().toISOString().split('T')[0]}`,
        shareableSlug: slug,
        isPublic: input.isPublic,
        status: input.isPublic ? 'PUBLISHED' : 'DRAFT',
        publishedAt: input.isPublic ? new Date() : null,
        publishedById: userId,
        submissionIds: input.submissionIds,
      };

      // Create magazine
      const magazine = await MagazineRepository.create(magazineData, tx);

      // Log the creation
      await createAuditLogInTransaction(tx, {
        userId,
        action: AuditActions.CREATE_MAGAZINE,
        entityType: EntityTypes.MAGAZINE,
        entityId: magazine.id,
        details: {
          title: magazine.title,
          itemCount: input.submissionIds.length,
          isPublic: input.isPublic,
        },
      });

      return magazine;
    });
  }

  /**
   * Publish a draft magazine
   * Includes audit logging in transaction
   */
  static async publishMagazine(
    id: string,
    userId: string
  ): Promise<MagazineWithRelations> {
    return prisma.$transaction(async (tx) => {
      // Get current magazine
      const currentMagazine = await MagazineRepository.findById(id, tx);

      if (!currentMagazine) {
        throw new NotFoundError('Magazine not found');
      }

      // Validate that it's a draft
      if (currentMagazine.status !== 'DRAFT') {
        throw new ValidationError('Only draft magazines can be published');
      }

      // Update magazine to published
      const magazine = await MagazineRepository.updateStatus(
        id,
        {
          status: 'PUBLISHED',
          isPublic: true,
          publishedAt: new Date(),
        },
        tx
      );

      // Log the publication
      await createAuditLogInTransaction(tx, {
        userId,
        action: AuditActions.PUBLISH_MAGAZINE,
        entityType: EntityTypes.MAGAZINE,
        entityId: id,
        details: {
          title: magazine.title,
          itemCount: magazine.items.length,
        },
      });

      return magazine;
    });
  }

  /**
   * Unpublish a magazine
   * Includes audit logging in transaction
   */
  static async unpublishMagazine(
    id: string,
    userId: string
  ): Promise<MagazineWithRelations> {
    return prisma.$transaction(async (tx) => {
      // Get current magazine
      const currentMagazine = await MagazineRepository.findById(id, tx);

      if (!currentMagazine) {
        throw new NotFoundError('Magazine not found');
      }

      // Update magazine to draft
      const magazine = await MagazineRepository.updateStatus(
        id,
        {
          status: 'DRAFT',
          isPublic: false,
        },
        tx
      );

      // Log the unpublication
      await createAuditLogInTransaction(tx, {
        userId,
        action: AuditActions.UNPUBLISH_MAGAZINE,
        entityType: EntityTypes.MAGAZINE,
        entityId: id,
        details: {
          title: magazine.title,
        },
      });

      return magazine;
    });
  }

  /**
   * Delete a draft magazine
   * Includes audit logging in transaction
   */
  static async deleteMagazine(
    id: string,
    userId: string
  ): Promise<void> {
    return prisma.$transaction(async (tx) => {
      // Get magazine details before deletion
      const magazine = await MagazineRepository.findById(id, tx);

      if (!magazine) {
        throw new NotFoundError('Magazine not found');
      }

      // Only allow deletion of draft magazines
      if (magazine.status !== 'DRAFT') {
        throw new ValidationError('Only draft magazines can be deleted');
      }

      // Delete magazine
      await MagazineRepository.delete(id, tx);

      // Log the deletion
      await createAuditLogInTransaction(tx, {
        userId,
        action: AuditActions.DELETE_MAGAZINE,
        entityType: EntityTypes.MAGAZINE,
        entityId: id,
        details: {
          title: magazine.title,
        },
      });
    });
  }

  /**
   * Get published magazines (for public view)
   */
  static async getPublishedMagazines(): Promise<MagazineWithRelations[]> {
    return MagazineRepository.findPublished();
  }

  /**
   * Get draft magazines (for admin)
   */
  static async getDraftMagazines(): Promise<MagazineWithRelations[]> {
    return MagazineRepository.findDrafts();
  }

  /**
   * Get magazine statistics
   */
  static async getStatistics(): Promise<{
    draft: number;
    published: number;
    archived: number;
    total: number;
  }> {
    const [draft, published, archived] = await Promise.all([
      MagazineRepository.countByStatus('DRAFT'),
      MagazineRepository.countByStatus('PUBLISHED'),
      MagazineRepository.countByStatus('ARCHIVED'),
    ]);

    return {
      draft,
      published,
      archived,
      total: draft + published + archived,
    };
  }
}
