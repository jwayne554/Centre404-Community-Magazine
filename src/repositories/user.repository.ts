/**
 * User Repository - Database access layer
 * Task 3.4: Implement Layered Architecture
 */

import prisma from '@/lib/prisma';
import { Prisma, User, UserRole } from '@prisma/client';

/**
 * User without password (safe for API responses)
 */
export type UserWithoutPassword = Omit<User, 'password'>;

/**
 * Data for creating a user
 */
export interface CreateUserData {
  email?: string | null;
  name: string;
  password?: string | null;
  role?: UserRole;
}

/**
 * Data for updating a user
 */
export interface UpdateUserData {
  email?: string;
  name?: string;
  password?: string;
  role?: UserRole;
}

/**
 * User Repository Class
 * Encapsulates all database operations for users
 */
export class UserRepository {
  /**
   * Find a user by ID
   */
  static async findById(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<User | null> {
    const client = tx || prisma;
    return client.user.findUnique({ where: { id } });
  }

  /**
   * Find a user by email
   */
  static async findByEmail(
    email: string,
    tx?: Prisma.TransactionClient
  ): Promise<User | null> {
    const client = tx || prisma;
    return client.user.findUnique({ where: { email } });
  }

  /**
   * Find a user by ID without password (safe for API)
   */
  static async findByIdSafe(
    id: string,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithoutPassword | null> {
    const client = tx || prisma;
    return client.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        accessibilityPrefs: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    });
  }

  /**
   * Find all users (without passwords)
   */
  static async findMany(
    tx?: Prisma.TransactionClient
  ): Promise<UserWithoutPassword[]> {
    const client = tx || prisma;
    return client.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        accessibilityPrefs: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Create a new user
   */
  static async create(
    data: CreateUserData,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithoutPassword> {
    const client = tx || prisma;

    const user = await client.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
        role: data.role || 'CONTRIBUTOR',
      },
    });

    // Remove password before returning
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update a user
   */
  static async update(
    id: string,
    data: UpdateUserData,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithoutPassword> {
    const client = tx || prisma;

    const user = await client.user.update({
      where: { id },
      data,
    });

    // Remove password before returning
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Delete a user
   */
  static async delete(id: string, tx?: Prisma.TransactionClient): Promise<void> {
    const client = tx || prisma;
    await client.user.delete({ where: { id } });
  }

  /**
   * Check if email exists
   */
  static async emailExists(
    email: string,
    tx?: Prisma.TransactionClient
  ): Promise<boolean> {
    const client = tx || prisma;
    const count = await client.user.count({ where: { email } });
    return count > 0;
  }

  /**
   * Count users by role
   */
  static async countByRole(
    role: UserRole,
    tx?: Prisma.TransactionClient
  ): Promise<number> {
    const client = tx || prisma;
    return client.user.count({ where: { role } });
  }

  /**
   * Find users by role
   */
  static async findByRole(
    role: UserRole,
    tx?: Prisma.TransactionClient
  ): Promise<UserWithoutPassword[]> {
    const client = tx || prisma;
    return client.user.findMany({
      where: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        accessibilityPrefs: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
