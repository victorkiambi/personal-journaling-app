import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { subDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.entryMetadata.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.category.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: await bcrypt.hash('password123', 10),
      settings: {
        create: {
          theme: 'light',
          emailNotifications: true,
        },
      },
      profile: {
        create: {
          bio: 'Software developer and tech enthusiast',
          location: 'New York',
        },
      },
      categories: {
        create: [
          { name: 'Personal', color: '#FF5733' },
          { name: 'Work', color: '#33FF57' },
          { name: 'Travel', color: '#3357FF' },
        ],
      },
    },
    include: {
      categories: true,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: await bcrypt.hash('password123', 10),
      settings: {
        create: {
          theme: 'dark',
          emailNotifications: false,
        },
      },
      profile: {
        create: {
          bio: 'Digital artist and creative writer',
          location: 'London',
        },
      },
      categories: {
        create: [
          { name: 'Art', color: '#FF33FF' },
          { name: 'Writing', color: '#33FFFF' },
          { name: 'Ideas', color: '#FFFF33' },
        ],
      },
    },
    include: {
      categories: true,
    },
  });

  // Create sample journal entries for user1 across different days
  const today = new Date();
  const entries = [
    {
      title: 'My First Journal Entry',
      content: 'Today was a great day! I started my new journaling practice and I\'m excited to see where this journey takes me. The weather was beautiful, and I spent some time working on my new project.',
      createdAt: today,
      categoryId: user1.categories[0].id,
      wordCount: 150,
      readingTime: 1,
    },
    {
      title: 'Project Progress',
      content: 'Made significant progress on the new feature today. The team had a great brainstorming session, and we came up with some innovative solutions. Looking forward to implementing these ideas tomorrow.',
      createdAt: subDays(today, 1),
      categoryId: user1.categories[1].id,
      wordCount: 200,
      readingTime: 2,
    },
    {
      title: 'Travel Plans',
      content: 'Started planning my upcoming trip to Europe. The itinerary is coming together nicely. I\'m particularly excited about visiting the museums and trying the local cuisine.',
      createdAt: subDays(today, 2),
      categoryId: user1.categories[2].id,
      wordCount: 180,
      readingTime: 1,
    },
    {
      title: 'Personal Growth',
      content: 'Reflecting on my personal development journey. I\'ve been reading more books lately and trying to develop new habits. The morning routine is working well.',
      createdAt: subDays(today, 3),
      categoryId: user1.categories[0].id,
      wordCount: 220,
      readingTime: 2,
    },
    {
      title: 'Work-Life Balance',
      content: 'Today I focused on improving my work-life balance. Took breaks throughout the day and went for a walk during lunch. Feeling more energized and productive.',
      createdAt: subDays(today, 4),
      categoryId: user1.categories[1].id,
      wordCount: 160,
      readingTime: 1,
    },
    {
      title: 'Weekend Adventures',
      content: 'Spent the weekend exploring new hiking trails. The views were breathtaking, and I got some great photos. Nature has a way of putting everything in perspective.',
      createdAt: subDays(today, 5),
      categoryId: user1.categories[2].id,
      wordCount: 190,
      readingTime: 2,
    },
  ];

  // Create entries for user1
  for (const entry of entries) {
    await prisma.journalEntry.create({
      data: {
        title: entry.title,
        content: entry.content,
        userId: user1.id,
        createdAt: entry.createdAt,
        categories: {
          connect: [{ id: entry.categoryId }],
        },
        metadata: {
          create: {
            wordCount: entry.wordCount,
            readingTime: entry.readingTime,
          },
        },
      },
    });
  }

  // Create sample journal entries for user2 across different days
  const user2Entries = [
    {
      title: 'Creative Inspiration',
      content: 'Found inspiration in the most unexpected places today. The city\'s architecture and street art provided endless creative ideas for my next project.',
      createdAt: today,
      categoryId: user2.categories[0].id,
      wordCount: 170,
      readingTime: 1,
    },
    {
      title: 'Writing Process',
      content: 'Experimented with a new writing technique today. The results were interesting, and I learned a lot about my creative process. Need to refine it further.',
      createdAt: subDays(today, 1),
      categoryId: user2.categories[1].id,
      wordCount: 210,
      readingTime: 2,
    },
    {
      title: 'New Ideas',
      content: 'Had a breakthrough moment with my latest project. The ideas are flowing, and I\'m excited to see where they lead. Sometimes the best ideas come when you least expect them.',
      createdAt: subDays(today, 2),
      categoryId: user2.categories[2].id,
      wordCount: 180,
      readingTime: 1,
    },
    {
      title: 'Artistic Journey',
      content: 'Started a new art series today. The first piece is coming together nicely. It\'s amazing how each piece evolves in its own unique way.',
      createdAt: subDays(today, 3),
      categoryId: user2.categories[0].id,
      wordCount: 150,
      readingTime: 1,
    },
    {
      title: 'Creative Block',
      content: 'Facing a bit of a creative block today. Instead of forcing it, I took a step back and did some research. Sometimes the best way forward is to pause and reflect.',
      createdAt: subDays(today, 4),
      categoryId: user2.categories[1].id,
      wordCount: 160,
      readingTime: 1,
    },
    {
      title: 'Project Planning',
      content: 'Spent the day planning my next creative project. Breaking it down into smaller tasks makes it feel more manageable. Looking forward to getting started.',
      createdAt: subDays(today, 5),
      categoryId: user2.categories[2].id,
      wordCount: 190,
      readingTime: 2,
    },
  ];

  // Create entries for user2
  for (const entry of user2Entries) {
    await prisma.journalEntry.create({
      data: {
        title: entry.title,
        content: entry.content,
        userId: user2.id,
        createdAt: entry.createdAt,
        categories: {
          connect: [{ id: entry.categoryId }],
        },
        metadata: {
          create: {
            wordCount: entry.wordCount,
            readingTime: entry.readingTime,
          },
        },
      },
    });
  }

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 