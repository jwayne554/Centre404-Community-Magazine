import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/api-auth';
import { handleApiError } from '@/lib/api-errors';
import { MagazineService } from '@/services/magazine.service';

// PATCH /api/magazines/[id] - Publish a draft magazine
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Require ADMIN role
    const authResult = await requireAdmin(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { userId } = authResult.auth;

    // Use service layer - handles validation, transaction, and audit logging
    const magazine = await MagazineService.publishMagazine(id, userId);

    // Revalidate magazine cache after publishing
    revalidatePath('/api/magazines');
    revalidatePath('/magazines');

    return NextResponse.json(magazine);
  } catch (error) {
    console.error('Failed to publish magazine:', error);
    return handleApiError(error);
  }
}

// DELETE /api/magazines/[id] - Delete a draft magazine
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Require ADMIN role
    const authResult = await requireAdmin(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { userId } = authResult.auth;

    // Use service layer - handles validation, transaction, and audit logging
    await MagazineService.deleteMagazine(id, userId);

    // Revalidate cache (for admin views showing drafts)
    revalidatePath('/api/magazines');
    revalidatePath('/magazines');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete magazine:', error);
    return handleApiError(error);
  }
}
