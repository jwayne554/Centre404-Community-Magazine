import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/api-auth';

const createMagazineSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  submissionIds: z.array(z.string()),
  isPublic: z.boolean().default(false),
});

// GET /api/magazines - Get all magazines
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isPublic = searchParams.get('public') === 'true';

    const magazines = await prisma.magazine.findMany({
      where: isPublic ? { isPublic: true, status: 'PUBLISHED' } : {},
      include: {
        items: {
          include: {
            submission: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            displayOrder: 'asc',
          },
        },
        publishedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });

    return NextResponse.json(magazines);
  } catch (error) {
    console.error('Failed to fetch magazines:', error);
    return NextResponse.json(
      { error: 'Failed to fetch magazines' },
      { status: 500 }
    );
  }
}

// POST /api/magazines - Create a new magazine
export async function POST(request: NextRequest) {
  try {
    // Require ADMIN role
    const authResult = await requireAdmin(request);
    if ('error' in authResult) {
      return authResult.error;
    }

    const { userId } = authResult.auth;

    const body = await request.json();
    const validatedData = createMagazineSchema.parse(body);

    // Generate unique slug
    const slug = `${validatedData.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    // Create magazine with items
    const magazine = await prisma.magazine.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        version: `v${new Date().toISOString().split('T')[0]}`,
        shareableSlug: slug,
        isPublic: validatedData.isPublic,
        status: validatedData.isPublic ? 'PUBLISHED' : 'DRAFT',
        publishedAt: validatedData.isPublic ? new Date() : null,
        publishedById: userId,
        items: {
          create: validatedData.submissionIds.map((submissionId, index) => ({
            submissionId,
            displayOrder: index,
          })),
        },
      },
      include: {
        items: {
          include: {
            submission: true,
          },
        },
      },
    });

    // Log the action (userId can be null for anonymous admin actions)
    await prisma.auditLog.create({
      data: {
        userId: userId,  // null is valid for anonymous actions
        action: 'CREATE_MAGAZINE',
        entityType: 'magazine',
        entityId: magazine.id,
        details: JSON.stringify({
          title: magazine.title,
          itemCount: validatedData.submissionIds.length,
          isPublic: validatedData.isPublic,
        }),
      },
    });

    return NextResponse.json(magazine, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Failed to create magazine:', error);
    return NextResponse.json(
      { error: 'Failed to create magazine' },
      { status: 500 }
    );
  }
}