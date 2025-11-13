/**
 * Centralized API error handling
 * Task 3.6: Standardize Error Handling
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

/**
 * Standard API error response format
 */
export interface ApiErrorResponse {
  error: string;
  details?: unknown;
  code?: string;
}

/**
 * Custom API error class for better error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Common API errors
 */
export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed', details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Centralized error handler for API routes
 * Handles different error types and returns consistent responses
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  // Handle custom API errors
  if (error instanceof ApiError) {
    const response: ApiErrorResponse = {
      error: error.message,
      code: error.code,
    };
    if (error.details) {
      response.details = error.details;
    }
    return NextResponse.json(response, { status: error.statusCode });
  }

  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
        })),
      },
      { status: 400 }
    );
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error);
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    const response: ApiErrorResponse = {
      error: 'Invalid database query',
      code: 'DATABASE_VALIDATION_ERROR',
    };
    if (process.env.NODE_ENV === 'development') {
      response.details = error.message;
    }
    return NextResponse.json(response, { status: 400 });
  }

  // Handle generic errors
  if (error instanceof Error) {
    console.error('[API Error]', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    const response: ApiErrorResponse = {
      error:
        process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
      code: 'INTERNAL_ERROR',
    };

    if (process.env.NODE_ENV === 'development') {
      response.details = {
        name: error.name,
        stack: error.stack,
      };
    }

    return NextResponse.json(response, { status: 500 });
  }

  // Handle unknown errors
  console.error('[API Error] Unknown error type:', error);
  return NextResponse.json(
    {
      error: 'Internal server error',
      code: 'UNKNOWN_ERROR',
    },
    { status: 500 }
  );
}

/**
 * Handle Prisma-specific errors with appropriate status codes
 */
function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError
): NextResponse<ApiErrorResponse> {
  switch (error.code) {
    // Unique constraint violation
    case 'P2002': {
      const target = error.meta?.target as string[] | undefined;
      const fields = target ? target.join(', ') : 'field';
      return NextResponse.json(
        {
          error: `Duplicate entry: ${fields} already exists`,
          code: 'DUPLICATE_ENTRY',
          details: error.meta,
        },
        { status: 409 }
      );
    }

    // Record not found
    case 'P2025':
      return NextResponse.json(
        {
          error: 'Record not found',
          code: 'NOT_FOUND',
          details: error.meta,
        },
        { status: 404 }
      );

    // Foreign key constraint violation
    case 'P2003':
      return NextResponse.json(
        {
          error: 'Related record not found',
          code: 'FOREIGN_KEY_VIOLATION',
          details: error.meta,
        },
        { status: 400 }
      );

    // Required relation missing
    case 'P2014':
      return NextResponse.json(
        {
          error: 'Required relation missing',
          code: 'RELATION_VIOLATION',
          details: error.meta,
        },
        { status: 400 }
      );

    // Record being used by other records
    case 'P2018':
      return NextResponse.json(
        {
          error: 'Cannot delete: record is being used',
          code: 'RECORD_IN_USE',
          details: error.meta,
        },
        { status: 409 }
      );

    // Default for other Prisma errors
    default: {
      console.error('[Prisma Error]', {
        code: error.code,
        message: error.message,
        meta: error.meta,
      });

      const response: ApiErrorResponse = {
        error:
          process.env.NODE_ENV === 'development'
            ? `Database error: ${error.message}`
            : 'Database error occurred',
        code: error.code,
      };

      if (process.env.NODE_ENV === 'development') {
        response.details = error.meta;
      }

      return NextResponse.json(response, { status: 500 });
    }
  }
}

/**
 * Wrap an async route handler with error handling
 * Usage: export const GET = withErrorHandling(async (request) => { ... })
 */
export function withErrorHandling<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
): (...args: T) => Promise<NextResponse> {
  return async (...args: T) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}
