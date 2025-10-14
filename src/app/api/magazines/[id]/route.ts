import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// PATCH /api/magazines/[id] - Publish a draft magazine
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id') || null;

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
    const userId = request.headers.get('x-user-id') || null;

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete magazine:', error);
    return NextResponse.json(
      { error: 'Failed to delete magazine' },
      { status: 500 }
    );
  }
}
