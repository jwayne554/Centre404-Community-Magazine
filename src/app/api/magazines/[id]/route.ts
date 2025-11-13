import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

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

    // Update magazine to published
    const magazine = await prisma.magazine.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        isPublic: true,
        publishedAt: new Date(),
      },
      include: {
        items: {
          include: {
            submission: true,
          },
        },
      },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'PUBLISH_MAGAZINE',
        entityType: 'magazine',
        entityId: id,
        details: JSON.stringify({
          title: magazine.title,
          itemCount: magazine.items.length,
        }),
      },
    });

    // Revalidate magazine cache after publishing
    revalidatePath('/api/magazines');
    revalidatePath('/magazines');

    return NextResponse.json(magazine);
  } catch (error) {
    console.error('Failed to publish magazine:', error);
    return NextResponse.json(
      { error: 'Failed to publish magazine' },
      { status: 500 }
    );
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

    // Get magazine details before deletion
    const magazine = await prisma.magazine.findUnique({
      where: { id },
      select: { title: true, status: true },
    });

    // Only allow deletion of draft magazines
    if (magazine?.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only draft magazines can be deleted' },
        { status: 400 }
      );
    }

    // Delete magazine (cascade will delete magazine items)
    await prisma.magazine.delete({
      where: { id },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: userId,
        action: 'DELETE_MAGAZINE',
        entityType: 'magazine',
        entityId: id,
        details: JSON.stringify({
          title: magazine.title,
        }),
      },
    });

    // Revalidate cache (for admin views showing drafts)
    revalidatePath('/api/magazines');
    revalidatePath('/magazines');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete magazine:', error);
    return NextResponse.json(
      { error: 'Failed to delete magazine' },
      { status: 500 }
    );
  }
}
