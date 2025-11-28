import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for toggling likes
const toggleLikeSchema = z.object({
  magazineItemId: z.string().uuid(),
  sessionId: z.string().optional(),
});

/**
 * GET /api/magazines/[id]/likes
 * Fetch all likes for magazine items in a specific magazine
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const magazineId = resolvedParams.id;

    // Fetch all likes for this magazine's items
    const likes = await prisma.like.findMany({
      where: {
        magazineItem: {
          magazineId,
        },
      },
      include: {
        magazineItem: true,
      },
    });

    // Group likes by magazine item ID and count them
    const likesByItem = likes.reduce((acc, like) => {
      if (!acc[like.magazineItemId]) {
        acc[like.magazineItemId] = {
          count: 0,
          userLiked: false,
        };
      }
      acc[like.magazineItemId].count++;
      return acc;
    }, {} as Record<string, { count: number; userLiked: boolean }>);

    return NextResponse.json({
      success: true,
      data: likesByItem,
    });
  } catch (error) {
    console.error('Error fetching likes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch likes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/magazines/[id]/likes
 * Toggle like for a specific magazine item (like if not liked, unlike if already liked)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const magazineId = resolvedParams.id;
    const body = await request.json();

    // Validate request body
    const validatedData = toggleLikeSchema.parse(body);
    const { magazineItemId, sessionId } = validatedData;

    // Verify magazine item belongs to this magazine
    const magazineItem = await prisma.magazineItem.findFirst({
      where: {
        id: magazineItemId,
        magazineId,
      },
    });

    if (!magazineItem) {
      return NextResponse.json(
        { success: false, error: 'Magazine item not found' },
        { status: 404 }
      );
    }

    // Check if like already exists for this session
    const existingLike = await prisma.like.findFirst({
      where: {
        magazineItemId,
        sessionId: sessionId || null,
      },
    });

    if (existingLike) {
      // Unlike: Delete existing like
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });

      // Fetch updated like count
      const likeCount = await prisma.like.count({
        where: { magazineItemId },
      });

      return NextResponse.json({
        success: true,
        data: {
          liked: false,
          likeCount,
          magazineItemId,
        },
      });
    } else {
      // Like: Create new like
      await prisma.like.create({
        data: {
          magazineItemId,
          sessionId: sessionId || null,
          ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0] || null,
        },
      });

      // Fetch updated like count
      const likeCount = await prisma.like.count({
        where: { magazineItemId },
      });

      return NextResponse.json({
        success: true,
        data: {
          liked: true,
          likeCount,
          magazineItemId,
        },
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error toggling like:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}
