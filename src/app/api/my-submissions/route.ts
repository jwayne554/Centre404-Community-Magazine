import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/my-submissions
 * Fetches submissions for a user based on their sessionId (stored in localStorage)
 * This allows anonymous users to track their submissions without authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Get sessionId from query params or header
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Fetch submissions by sessionId directly
    const submissions = await prisma.submission.findMany({
      where: { sessionId },
      orderBy: { submittedAt: 'desc' },
      include: {
        user: {
          select: { name: true },
        },
        magazineItems: {
          include: {
            magazine: {
              select: {
                id: true,
                title: true,
                isPublic: true,
                publishedAt: true,
              },
            },
          },
        },
      },
    });

    // Transform submissions to include publication info
    const transformedSubmissions = submissions.map((sub) => ({
      id: sub.id,
      category: sub.category,
      contentType: sub.contentType,
      textContent: sub.textContent,
      mediaUrl: sub.mediaUrl,
      drawingData: sub.drawingData ? '[Drawing]' : null, // Don't send full data
      status: sub.status,
      submittedAt: sub.submittedAt,
      authorName: sub.user?.name || 'Community Member',
      // Publication info
      isPublished: sub.magazineItems.some((item) => item.magazine.isPublic),
      publishedIn: sub.magazineItems
        .filter((item) => item.magazine.isPublic)
        .map((item) => ({
          magazineId: item.magazine.id,
          title: item.magazine.title,
          publishedAt: item.magazine.publishedAt,
        })),
    }));

    return NextResponse.json({
      submissions: transformedSubmissions,
      count: transformedSubmissions.length,
    });
  } catch (error) {
    console.error('Error fetching my submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
