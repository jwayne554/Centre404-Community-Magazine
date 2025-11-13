import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create test admin user
  const adminPassword = await bcrypt.hash('password123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      name: 'Test Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Created admin user: admin@test.com / password123');

  // Create test contributors
  const contributor1 = await prisma.user.upsert({
    where: { email: 'user1@test.com' },
    update: {},
    create: {
      email: 'user1@test.com',
      name: 'Sarah Johnson',
      password: await bcrypt.hash('password123', 12),
      role: 'CONTRIBUTOR',
    },
  });

  const contributor2 = await prisma.user.upsert({
    where: { email: 'user2@test.com' },
    update: {},
    create: {
      email: 'user2@test.com',
      name: 'Mike Smith',
      password: await bcrypt.hash('password123', 12),
      role: 'CONTRIBUTOR',
    },
  });

  // Create sample submissions
  const submissions = [
    {
      userId: contributor1.id,
      category: 'MY_NEWS' as const,
      contentType: 'TEXT' as const,
      status: 'APPROVED' as const,
      textContent: 'I had a wonderful day at the park today! The weather was perfect and I met some friendly dogs. 🌞',
      accessibilityText: 'A happy story about visiting the park',
    },
    {
      userId: contributor2.id,
      category: 'SAYING_HELLO' as const,
      contentType: 'TEXT' as const,
      status: 'APPROVED' as const,
      textContent: 'Hello everyone! I hope you are all having a great week. Looking forward to seeing you at the community center!',
      accessibilityText: 'A friendly greeting message',
    },
    {
      userId: contributor1.id,
      category: 'MY_SAY' as const,
      contentType: 'TEXT' as const,
      status: 'APPROVED' as const,
      textContent: 'I think we should have more art classes. Drawing and painting make me happy and help me express myself.',
      accessibilityText: 'Suggestion for more art classes',
    },
    {
      userId: contributor2.id,
      category: 'MY_NEWS' as const,
      contentType: 'TEXT' as const,
      status: 'PENDING' as const,
      textContent: 'I learned how to make cookies yesterday! They turned out delicious. I will bring some to share next time.',
      accessibilityText: 'Story about learning to bake',
    },
  ];

  for (const submission of submissions) {
    await prisma.submission.create({
      data: submission,
    });
  }

  console.log('✅ Created 4 sample submissions (3 approved, 1 pending)');

  // Create a sample magazine
  await prisma.magazine.create({
    data: {
      title: 'Community Voices - Winter Edition',
      description: 'Our first community magazine featuring stories from our members',
      version: 'v2024-01',
      shareableSlug: 'community-voices-winter-2024',
      isPublic: true,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      publishedById: admin.id,
    },
  });

  console.log('✅ Created sample magazine');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });