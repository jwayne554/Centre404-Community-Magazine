'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SubmissionSkeletonGrid } from '@/components/skeletons/submission-skeleton';

interface ProtectedRouteProps {
  children: ReactNode;
  /** Required role(s) to access this route. If array, user must have one of the roles. */
  requiredRole?: 'ADMIN' | 'MODERATOR' | 'CONTRIBUTOR' | ('ADMIN' | 'MODERATOR' | 'CONTRIBUTOR')[];
  /** Custom loading component (optional) */
  loadingComponent?: ReactNode;
  /** Custom forbidden component (optional) */
  forbiddenComponent?: ReactNode;
  /** Where to redirect if not authenticated (default: '/login') */
  redirectTo?: string;
  /** Where to redirect if forbidden (default: show inline message, set to '/forbidden' to redirect) */
  forbiddenRedirect?: string;
}

/**
 * ProtectedRoute Component
 *
 * Wraps content that requires authentication and/or specific roles.
 * Handles loading states, redirects, and role-based access control.
 *
 * @example
 * // Admin-only route
 * <ProtectedRoute requiredRole="ADMIN">
 *   <AdminDashboard />
 * </ProtectedRoute>
 *
 * @example
 * // Multiple roles allowed
 * <ProtectedRoute requiredRole={['ADMIN', 'MODERATOR']}>
 *   <ModeratorPanel />
 * </ProtectedRoute>
 *
 * @example
 * // Any authenticated user
 * <ProtectedRoute>
 *   <UserProfile />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  requiredRole,
  loadingComponent,
  forbiddenComponent,
  redirectTo = '/login',
  forbiddenRedirect,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Show loading state while checking authentication
  if (authLoading) {
    return loadingComponent || (
      <div style={{ minHeight: '100vh', padding: '40px' }}>
        <SubmissionSkeletonGrid count={5} />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    router.push(redirectTo);
    return null;
  }

  // Check role-based access if required
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRequiredRole = user?.role && allowedRoles.includes(user.role);

    if (!hasRequiredRole) {
      // Redirect to custom forbidden page if specified
      if (forbiddenRedirect) {
        router.push(forbiddenRedirect);
        return null;
      }

      // Otherwise show custom component or default inline message
      return forbiddenComponent || (
        <div className="container" style={{ maxWidth: '800px', margin: '40px auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', color: '#e74c3c', marginBottom: '20px' }}>
            Access Denied
          </h1>
          <p style={{ fontSize: '18px', color: '#7f8c8d', marginBottom: '30px' }}>
            You don't have permission to access this page.
          </p>
          <p style={{ fontSize: '16px', color: '#95a5a6', marginBottom: '30px' }}>
            Required role: {allowedRoles.join(' or ')}
            <br />
            Your role: {user?.role || 'Unknown'}
          </p>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: '12px 24px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Go Home
          </button>
        </div>
      );
    }
  }

  // Render protected content
  return <>{children}</>;
}
