import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.entryMetadata.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.category.deleteMany();
  await prisma.userPreferences.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        name: 'John Doe',
        preferences: {
          create: {
            theme: 'light',
            fontSize: 16,
            emailNotifications: true
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'jane@example.com',
        passwordHash: await bcrypt.hash('password123', 10),
        name: 'Jane Smith',
        preferences: {
          create: {
            theme: 'dark',
            fontSize: 18,
            emailNotifications: false
          }
        }
      }
    })
  ]);

  const [john, jane] = users;

  // Create categories for John
  const johnCategories = await Promise.all([
    prisma.category.create({
      data: {
        userId: john.id,
        name: 'Personal',
        color: '#FF5733',
        description: 'Personal thoughts and reflections'
      }
    }),
    prisma.category.create({
      data: {
        userId: john.id,
        name: 'Work',
        color: '#33FF57',
        description: 'Work-related entries'
      }
    }),
    prisma.category.create({
      data: {
        userId: john.id,
        name: 'Travel',
        color: '#3357FF',
        description: 'Travel experiences and memories'
      }
    })
  ]);

  // Create categories for Jane
  const janeCategories = await Promise.all([
    prisma.category.create({
      data: {
        userId: jane.id,
        name: 'Fitness',
        color: '#FF33A8',
        description: 'Workout and health tracking'
      }
    }),
    prisma.category.create({
      data: {
        userId: jane.id,
        name: 'Learning',
        color: '#33FFF5',
        description: 'Study notes and learnings'
      }
    })
  ]);

  // Create journal entries for John
  const johnEntries = await Promise.all([
    prisma.journalEntry.create({
      data: {
        userId: john.id,
        title: 'First Day at Work',
        content: 'Today was my first day at the new job. The team seems great, and I\'m excited about the projects ahead. Met with my manager and got a tour of the office. Looking forward to making meaningful contributions.',
        isPublic: false,
        categories: {
          connect: [{ id: johnCategories[1].id }] // Work category
        },
        metadata: {
          create: {
            wordCount: 37,
            readingTime: 1,
            sentimentScore: 0.8
          }
        }
      }
    }),
    prisma.journalEntry.create({
      data: {
        userId: john.id,
        title: 'Weekend Trip to the Mountains',
        content: 'Spent the weekend hiking in the mountains. The views were breathtaking, and the fresh air was exactly what I needed. Reached the summit after a challenging 4-hour hike. Made some great memories and took plenty of photos.',
        isPublic: true,
        categories: {
          connect: [{ id: johnCategories[2].id }] // Travel category
        },
        metadata: {
          create: {
            wordCount: 42,
            readingTime: 1,
            sentimentScore: 0.9,
            location: {
              latitude: 45.5231,
              longitude: -122.6765
            }
          }
        }
      }
    })
  ]);

  // Create journal entries for Jane
  const janeEntries = await Promise.all([
    prisma.journalEntry.create({
      data: {
        userId: jane.id,
        title: 'New Personal Best',
        content: 'Hit a new personal best in deadlifts today! Finally reached 225 lbs after months of training. The consistency is paying off, and I\'m feeling stronger than ever. Need to focus on form for the next few weeks.',
        isPublic: false,
        categories: {
          connect: [{ id: janeCategories[0].id }] // Fitness category
        },
        metadata: {
          create: {
            wordCount: 39,
            readingTime: 1,
            sentimentScore: 0.95
          }
        }
      }
    }),
    prisma.journalEntry.create({
      data: {
        userId: jane.id,
        title: 'TypeScript Course Progress',
        content: 'Completed the advanced TypeScript course today. The sections on generics and utility types were particularly enlightening. Starting to see how powerful the type system can be. Next up: diving into design patterns.',
        isPublic: true,
        categories: {
          connect: [{ id: janeCategories[1].id }] // Learning category
        },
        metadata: {
          create: {
            wordCount: 35,
            readingTime: 1,
            sentimentScore: 0.7
          }
        }
      }
    })
  ]);

  console.log('Seed data created successfully!');
  console.log('\nTest Users:');
  console.log('1. John Doe (john@example.com / password123)');
  console.log('2. Jane Smith (jane@example.com / password123)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 