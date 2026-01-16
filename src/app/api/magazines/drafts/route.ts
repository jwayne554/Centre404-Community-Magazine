import { NextRequest, NextResponse } from 'next/server';
import { requireModerator } from '@/lib/api-auth';
import { handleApiError } from '@/lib/api-errors';
import { MagazineService } from '@/services/magazine.service';

/**
 * GET /api/magazines/drafts - Get all draft magazines (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Require ADMIN or MODERATOR role
    const authResult = await requireModerator(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const magazines = await MagazineService.getDraftMagazines();
    const stats = await MagazineService.getStatistics();

    return NextResponse.json({
      magazines,
      stats,
    });
  } catch (error) {
    console.error('Failed to fetch draft magazines:', error);
    return handleApiError(error);
  }
}
