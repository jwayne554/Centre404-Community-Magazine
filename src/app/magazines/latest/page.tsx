import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function LatestMagazinePage() {
  // Fetch the latest public magazine
  const latestMagazine = await prisma.magazine.findFirst({
    where: {
      isPublic: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    select: {
      id: true,
    },
  });

  // If no magazine exists, redirect to archive
  if (!latestMagazine) {
    redirect('/magazines');
  }

  // Redirect to the latest magazine
  redirect(`/magazines/${latestMagazine.id}`);
}
