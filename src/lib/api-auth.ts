import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export interface AuthContext {
  userId: string;
  userRole: string;
}

/**
 * Extracts and validates authentication from request headers
 * Supports both Authorization header and x-user-* headers (from middleware)
 */
export async function requireAuth(
  request: NextRequest,
  allowedRoles?: string[]
): Promise<{ error: NextResponse } | { success: true; auth: AuthContext }> {
  // First check if middleware already added headers
  let userId = request.headers.get('x-user-id');
  let userRole = request.headers.get('x-user-role');

  // If not present, try to extract from Authorization header
  if (!userId || !userRole) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return {
        error: NextResponse.json(
          { error: 'Unauthorized - Authentication required' },
          { status: 401 }
        ),
      };
    }

    try {
      const payload = AuthService.verifyAccessToken(token);
      userId = payload.userId;
      userRole = payload.role;
    } catch (error) {
      return {
        error: NextResponse.json(
          { error: 'Unauthorized - Invalid or expired token' },
          { status: 401 }
        ),
      };
    }
  }

  // Check role authorization if roles specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(userRole)) {
      return {
        error: NextResponse.json(
          {
            error: 'Forbidden - Insufficient permissions',
            required: allowedRoles,
            current: userRole,
          },
          { status: 403 }
        ),
      };
    }
  }

  return {
    success: true,
    auth: { userId, userRole },
  };
}

/**
 * Quick helper for admin-only routes
 */
export async function requireAdmin(request: NextRequest) {
  return requireAuth(request, ['ADMIN']);
}

/**
 * Quick helper for admin or moderator routes
 */
export async function requireModerator(request: NextRequest) {
  return requireAuth(request, ['ADMIN', 'MODERATOR']);
}
