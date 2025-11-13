/**
 * API Logger - Structured logging for API routes
 * Task 4.5: Add Comprehensive Logging
 */

import { NextRequest } from 'next/server';

export interface LogContext {
  timestamp: string;
  method: string;
  url: string;
  path: string;
  userId?: string;
  userRole?: string;
  ip?: string;
  userAgent?: string;
  duration?: number;
  status?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log levels
 */
export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

/**
 * Format log message with context
 */
function formatLog(level: LogLevel, message: string, context: Partial<LogContext>): string {
  const logData = {
    level,
    message,
    ...context,
  };

  return JSON.stringify(logData);
}

/**
 * Extract request context
 */
export function getRequestContext(request: NextRequest): Partial<LogContext> {
  return {
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    path: new URL(request.url).pathname,
    ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  };
}

/**
 * Log API request
 */
export function logRequest(
  request: NextRequest,
  options?: {
    userId?: string;
    userRole?: string;
    metadata?: Record<string, unknown>;
  }
): void {
  const context: Partial<LogContext> = {
    ...getRequestContext(request),
    userId: options?.userId,
    userRole: options?.userRole,
    metadata: options?.metadata,
  };

  console.log(formatLog(LogLevel.INFO, `[API Request] ${request.method} ${context.path}`, context));
}

/**
 * Log API response
 */
export function logResponse(
  request: NextRequest,
  response: {
    status: number;
    duration: number;
    userId?: string;
    userRole?: string;
    metadata?: Record<string, unknown>;
  }
): void {
  const context: Partial<LogContext> = {
    ...getRequestContext(request),
    status: response.status,
    duration: response.duration,
    userId: response.userId,
    userRole: response.userRole,
    metadata: response.metadata,
  };

  const level = response.status >= 400 ? LogLevel.WARN : LogLevel.INFO;
  console.log(
    formatLog(level, `[API Response] ${request.method} ${context.path} - ${response.status}`, context)
  );
}

/**
 * Log API error
 */
export function logError(
  request: NextRequest,
  error: unknown,
  options?: {
    userId?: string;
    userRole?: string;
    metadata?: Record<string, unknown>;
  }
): void {
  const context: Partial<LogContext> = {
    ...getRequestContext(request),
    userId: options?.userId,
    userRole: options?.userRole,
    error: error instanceof Error ? error.message : String(error),
    metadata: {
      ...options?.metadata,
      stack: error instanceof Error ? error.stack : undefined,
    },
  };

  console.error(formatLog(LogLevel.ERROR, `[API Error] ${request.method} ${context.path}`, context));
}

/**
 * Log debug information
 */
export function logDebug(message: string, metadata?: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== 'development') return;

  const context: Partial<LogContext> = {
    timestamp: new Date().toISOString(),
    metadata,
  };

  console.log(formatLog(LogLevel.DEBUG, `[Debug] ${message}`, context));
}

/**
 * Create a request timer for measuring duration
 */
export function createTimer(): { getElapsed: () => number } {
  const start = Date.now();

  return {
    getElapsed: () => Date.now() - start,
  };
}

/**
 * Helper to log complete request/response cycle
 */
export class RequestLogger {
  private timer = createTimer();

  constructor(
    private request: NextRequest,
    private options?: {
      userId?: string;
      userRole?: string;
      metadata?: Record<string, unknown>;
    }
  ) {
    logRequest(request, options);
  }

  success(status: number, metadata?: Record<string, unknown>): void {
    logResponse(this.request, {
      status,
      duration: this.timer.getElapsed(),
      userId: this.options?.userId,
      userRole: this.options?.userRole,
      metadata: { ...this.options?.metadata, ...metadata },
    });
  }

  error(error: unknown, metadata?: Record<string, unknown>): void {
    logError(this.request, error, {
      userId: this.options?.userId,
      userRole: this.options?.userRole,
      metadata: { ...this.options?.metadata, ...metadata },
    });
  }
}
