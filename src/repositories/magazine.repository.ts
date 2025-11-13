/**
 * Magazine Repository - Database access layer
 * Task 3.4: Implement Layered Architecture
 */

import prisma from '@/lib/prisma';
import { Prisma, Magazine, MagazineStatus } from '@prisma/client';

/**
 * Magazine with full relations
 */
export type MagazineWithRelations = Prisma.MagazineGetPayload<{
  include: {
    items: {
      include: {
        submission: {
          include: {
            user: {
              select: {
                id: true;
                name: true;
              };
            };
          };
        };
      };
    };
    publishedBy: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

/**
 * Magazine filters
 */
export interface MagazineFilters {
  isPublic?: boolean;
  status?: MagazineStatus;
  publishedById?: string;
}

/**
 * Data for creating a magazine
 */
export interface CreateMagazineData {
  title: string;
  description?: string;
  version?: string;
  shareableSlug: string;
  isPublic: boolean;
  status: MagazineStatus;
  publishedAt?: Date | null;
  publishedById: string;
  submissionIds: string[];
}

/**
 * Data for updating magazine status
 */
export interface UpdateMagazineStatusData {
  status: MagazineStatus;
  isPublic: boolean;
  publishedAt?: Date;
}

/**
 * Magazine Repository Class
 * Encapsulates all database operations for magazines
 */
export class MagazineRepository {
  /**
   * Find many magazines with filters
   */
  static async findMany(
    filters: MagazineFilters = {},
    tx?: Prisma.TransactionClient
  ): Promise<MagazineWithRelations[]> {
    const client = tx || prisma;

    const where: Prisma.MagazineWhereInput = {};

    if (filters.isPublic !== undefined) where.isPublic = filters.isPublic;
    if (filters.status) where.status = filters.status;
    if (filters.publishedById) where.publishedById = filters.publishedById;

    // If filtering for public magazines, also ensure they're published
    if (filters.isPublic === true) {
      where.status = 'PUBLISHED';
    }

    return client.magazine.findMany({
      where,
      include: {
        items: {
          include: {
            submission: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            displayOrder: 'asc',
          },
        },
        publishedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });
  }

  /**
   * Find a magazine by ID
   */
  static async findById(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<MagazineWithRelations | null> {
    const client = tx || prisma;

    return client.magazine.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            submission: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            displayOrder: 'asc',
          },
        },
        publishedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Find a magazine by slug
   */
  static async findBySlug(
    slug: string,
    tx?: Prisma.TransactionClient
  ): Promise<MagazineWithRelations | null> {
    const client = tx || prisma;

    return client.magazine.findUnique({
      where: { shareableSlug: slug },
      include: {
        items: {
          include: {
            submission: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            displayOrder: 'asc',
          },
        },
        publishedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Create a new magazine with items
   */
  static async create(
    data: CreateMagazineData,
    tx?: Prisma.TransactionClient
  ): Promise<MagazineWithRelations> {
    const client = tx || prisma;

    return client.magazine.create({
      data: {
        title: data.title,
        description: data.description,
        version: data.version || `v${new Date().toISOString().split('T')[0]}`,
        shareableSlug: data.shareableSlug,
        isPublic: data.isPublic,
        status: data.status,
        publishedAt: data.publishedAt,
        publishedById: data.publishedById,
        items: {
          create: data.submissionIds.map((submissionId, index) => ({
            submissionId,
            displayOrder: index,
          })),
        },
      },
      include: {
        items: {
          include: {
            submission: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        publishedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }) as unknown as Promise<MagazineWithRelations>;
  }

  /**
   * Update magazine status (publish/unpublish)
   */
  static async updateStatus(
    id: string,
    data: UpdateMagazineStatusData,
    tx?: Prisma.TransactionClient
  ): Promise<MagazineWithRelations> {
    const client = tx || prisma;

    return client.magazine.update({
      where: { id },
      data: {
        status: data.status,
        isPublic: data.isPublic,
        publishedAt: data.publishedAt,
      },
      include: {
        items: {
          include: {
            submission: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        publishedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Delete a magazine
   */
  static async delete(id: string, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || prisma;
    await client.magazine.delete({ where: { id } });
  }

  /**
   * Count magazines by status
   */
  static async countByStatus(
    status: MagazineStatus,
    tx?: Prisma.TransactionClient
  ): Promise<number> {
    const client = tx || prisma;
    return client.magazine.count({ where: { status } });
  }

  /**
   * Find draft magazines (for admin)
   */
  static async findDrafts(
    tx?: Prisma.TransactionClient
  ): Promise<MagazineWithRelations[]> {
    return this.findMany({ status: 'DRAFT' }, tx);
  }

  /**
   * Find published magazines (for public view)
   */
  static async findPublished(
    tx?: Prisma.TransactionClient
  ): Promise<MagazineWithRelations[]> {
    return this.findMany({ isPublic: true }, tx);
  }
}
