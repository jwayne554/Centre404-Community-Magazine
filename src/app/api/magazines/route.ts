import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/api-auth';
import { handleApiError } from '@/lib/api-errors';
import { MagazineService, CreateMagazineInput } from '@/services/magazine.service';
import { MagazineFilters } from '@/repositories/magazine.repository';

const createMagazineSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  submissionIds: z.array(z.string()),
  isPublic: z.boolean().default(false),
});

// GET /api/magazines - Get all magazines
// Public magazines cached for 5 minutes to reduce database load
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isPublic = searchParams.get('public') === 'true';

    const filters: MagazineFilters = {};

    if (isPublic) {
      filters.isPublic = true;
      filters.status = 'PUBLISHED';
    }

    // Use service layer
    const magazines = await MagazineService.getMagazines(filters);

    // Cache public magazine responses for 5 minutes
    const response = NextResponse.json(magazines);
    if (isPublic) {
      response.headers.set(
        'Cache-Control',
        'public, s-maxage=300, stale-while-revalidate=600'
      );
    }

    return response;
  } catch (error) {
    console.error('Failed to fetch magazines:', error);
    return handleApiError(error);
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

    const input: CreateMagazineInput = {
      title: validatedData.title,
      description: validatedData.description,
      submissionIds: validatedData.submissionIds,
      isPublic: validatedData.isPublic,
    };

    // Use service layer - handles transaction and audit logging
    const magazine = await MagazineService.createMagazine(input, userId);

    // Revalidate magazine cache if publishing
    if (validatedData.isPublic) {
      revalidatePath('/api/magazines');
      revalidatePath('/magazines');
    }

    return NextResponse.json(magazine, { status: 201 });
  } catch (error) {
    console.error('Failed to create magazine:', error);
    return handleApiError(error);
  }
}