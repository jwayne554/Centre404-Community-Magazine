/**
 * Centralized audit logging utility
 * Task 3.2: Create Shared Utilities
 */

import prisma from './prisma';
import { NextRequest } from 'next/server';
import type { Prisma } from '@prisma/client';

export interface AuditLogParams {
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
  request?: NextRequest;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  const {
    userId,
    action,
    entityType,
    entityId,
    details = {},
    request,
    ipAddress,
    userAgent
  } = params;

  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        details: JSON.stringify(details),
        ipAddress: ipAddress || request?.headers.get('x-forwarded-for') || null,
        userAgent: userAgent || request?.headers.get('user-agent') || null,
        timestamp: new Date()
      }
    });
  } catch (error) {
    // Log error but don't throw - audit logging should not break main functionality
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Create an audit log within a transaction
 * Useful when audit log must succeed/fail with the main operation
 */
export async function createAuditLogInTransaction(
  tx: Prisma.TransactionClient,
  params: Omit<AuditLogParams, 'request'> & { request?: NextRequest }
): Promise<void> {
  const {
    userId,
    action,
    entityType,
    entityId,
    details = {},
    request,
    ipAddress,
    userAgent
  } = params;

  await tx.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      details: JSON.stringify(details),
      ipAddress: ipAddress || request?.headers.get('x-forwarded-for') || null,
      userAgent: userAgent || request?.headers.get('user-agent') || null,
      timestamp: new Date()
    }
  });
}

/**
 * Common audit log actions - use these constants for consistency
 */
export const AuditActions = {
  // User actions
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_REGISTER: 'USER_REGISTER',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',

  // Submission actions
  CREATE_SUBMISSION: 'CREATE_SUBMISSION',
  UPDATE_SUBMISSION: 'UPDATE_SUBMISSION',
  DELETE_SUBMISSION: 'DELETE_SUBMISSION',
  APPROVE_SUBMISSION: 'APPROVE_SUBMISSION',
  REJECT_SUBMISSION: 'REJECT_SUBMISSION',

  // Magazine actions
  CREATE_MAGAZINE: 'CREATE_MAGAZINE',
  UPDATE_MAGAZINE: 'UPDATE_MAGAZINE',
  DELETE_MAGAZINE: 'DELETE_MAGAZINE',
  PUBLISH_MAGAZINE: 'PUBLISH_MAGAZINE',
  UNPUBLISH_MAGAZINE: 'UNPUBLISH_MAGAZINE',

  // Media actions
  UPLOAD_MEDIA: 'UPLOAD_MEDIA',
  DELETE_MEDIA: 'DELETE_MEDIA',

  // System actions
  SYSTEM_ERROR: 'SYSTEM_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const;

/**
 * Common entity types - use these constants for consistency
 */
export const EntityTypes = {
  USER: 'user',
  SUBMISSION: 'submission',
  MAGAZINE: 'magazine',
  MEDIA: 'media',
  AUDIT_LOG: 'audit_log'
} as const;

/**
 * Helper to log user authentication events
 */
export async function logAuthEvent(
  userId: string,
  action: typeof AuditActions[keyof typeof AuditActions],
  request?: NextRequest,
  details?: Record<string, unknown>
): Promise<void> {
  await createAuditLog({
    userId,
    action,
    entityType: EntityTypes.USER,
    entityId: userId,
    details,
    request
  });
}

/**
 * Helper to log submission status changes
 */
export async function logSubmissionStatusChange(
  submissionId: string,
  userId: string | null,
  oldStatus: string,
  newStatus: string,
  request?: NextRequest,
  reviewNotes?: string
): Promise<void> {
  const action = newStatus === 'APPROVED'
    ? AuditActions.APPROVE_SUBMISSION
    : newStatus === 'REJECTED'
    ? AuditActions.REJECT_SUBMISSION
    : AuditActions.UPDATE_SUBMISSION;

  await createAuditLog({
    userId,
    action,
    entityType: EntityTypes.SUBMISSION,
    entityId: submissionId,
    details: {
      oldStatus,
      newStatus,
      reviewNotes
    },
    request
  });
}

/**
 * Helper to log magazine publication
 */
export async function logMagazinePublication(
  magazineId: string,
  userId: string,
  isPublic: boolean,
  request?: NextRequest,
  details?: Record<string, unknown>
): Promise<void> {
  await createAuditLog({
    userId,
    action: isPublic ? AuditActions.PUBLISH_MAGAZINE : AuditActions.UNPUBLISH_MAGAZINE,
    entityType: EntityTypes.MAGAZINE,
    entityId: magazineId,
    details,
    request
  });
}

/**
 * Query audit logs with filters
 */
export async function getAuditLogs(filters: {
  userId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const {
    userId,
    entityType,
    entityId,
    action,
    startDate,
    endDate,
    limit = 100,
    offset = 0
  } = filters;

  const where: Prisma.AuditLogWhereInput = {};

  if (userId) where.userId = userId;
  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  if (action) where.action = action;

  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = startDate;
    if (endDate) where.timestamp.lte = endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit,
      skip: offset
    }),
    prisma.auditLog.count({ where })
  ]);

  return {
    logs,
    total,
    limit,
    offset
  };
}
