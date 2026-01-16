import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Layout from '@/components/ui/Layout';
import MagazineContent from '@/components/magazine/MagazineContent';
import MagazineViewer from '@/components/magazine/MagazineViewer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MagazineEditionPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch the magazine with its items and submissions
  const magazine = await prisma.magazine.findUnique({
    where: { id },
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

  // If magazine doesn't exist or is not public, show 404
  if (!magazine || !magazine.isPublic) {
    notFound();
  }

  // Fetch like counts for all items in this magazine
  const likes = await prisma.like.groupBy({
    by: ['magazineItemId'],
    where: {
      magazineItem: {
        magazineId: id,
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
