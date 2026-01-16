import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Layout from '@/components/ui/Layout';
import MagazineContent from '@/components/magazine/MagazineContent';
import MagazineViewer from '@/components/magazine/MagazineViewer';

export default async function LatestMagazinePage() {
  // Fetch the latest public magazine with its items
  const magazine = await prisma.magazine.findFirst({
    where: {
      isPublic: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
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
    },
  });

  // If no magazine exists, show 404
  if (!magazine) {
    notFound();
  }

  // Fetch like counts for all items in this magazine
  const likes = await prisma.like.groupBy({
    by: ['magazineItemId'],
    where: {
      magazineItem: {
        magazineId: magazine.id,
      },
    },
    _count: {
      id: true,
    },
  });

  // Create a map of item ID to like count
  const likeCounts: Record<string, number> = {};
  likes.forEach((like) => {
    likeCounts[like.magazineItemId] = like._count.id;
  });

  return (
    <Layout>
      <MagazineViewer title={magazine.title}>
        <MagazineContent magazine={magazine} likeCounts={likeCounts} />
      </MagazineViewer>
    </Layout>
  );
}
