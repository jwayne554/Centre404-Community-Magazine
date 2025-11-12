import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export interface AuthContext {
  userId: string;
  userRole: string;
}

/**
 * Extracts and validates authentication from request
 * Priority: cookies > Authorization header > x-user-* headers (from middleware)
 */
export async function requireAuth(
  request: NextRequest,
  allowedRoles?: string[]
): Promise<{ error: NextResponse } | { success: true; auth: AuthContext }> {
  let userId: string | null = null;
  let userRole: string | null = null;
  let token: string | null = null;

  // Priority 1: Check for token in HTTP-only cookies (most secure)
  token = request.cookies.get('accessToken')?.value || null;

  // Priority 2: Check Authorization header (for API clients)
  if (!token) {
    const authHeader = request.headers.get('authorization');
    token = authHeader?.replace('Bearer ', '') || null;
  }

  // Priority 3: Check if middleware already added headers
  if (!token) {
    userId = request.headers.get('x-user-id');
    userRole = request.headers.get('x-user-role');
  }

  // If we have a token, verify it
  if (token) {
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

  // If still no authentication, reject
  if (!userId || !userRole) {
    return {
      error: NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      ),
    };
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
