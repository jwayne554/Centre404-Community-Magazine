import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/api-auth';
import { handleApiError } from '@/lib/api-errors';
import { MagazineService } from '@/services/magazine.service';

// Schema for updating a magazine
const updateMagazineSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(500).nullable().optional(),
  submissionIds: z.array(z.string()).min(1).optional(),
});

// GET /api/magazines/[id] - Get a magazine by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const magazine = await MagazineService.getMagazineById(id);
    return NextResponse.json(magazine);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/magazines/[id] - Update a draft magazine
export async function PUT(
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
    const body = await request.json();
    const validatedData = updateMagazineSchema.parse(body);

    // Use service layer
    const magazine = await MagazineService.updateMagazine(id, validatedData, userId);

    // Revalidate cache
    revalidatePath('/api/magazines');
    revalidatePath(`/magazines/${id}`);

    return NextResponse.json(magazine);
  } catch (error) {
    console.error('Failed to update magazine:', error);
    return handleApiError(error);
  }
}

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
