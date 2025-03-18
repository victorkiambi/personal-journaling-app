import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john@example.com',
        name: 'John Doe',
        password: await bcrypt.hash('password123', 10),
        settings: {
          create: {
            theme: 'light',
            emailNotifications: true,
            reminderTime: new Date(new Date().setHours(9, 0, 0, 0)), // 9 AM reminder
          }
        },
        profile: {
          create: {
            bio: 'Software engineer and outdoor enthusiast',
            birthdate: new Date('1990-01-15'),
            location: 'San Francisco, CA',
            occupation: 'Software Engineer',
            interests: ['hiking', 'coding', 'photography']
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        email: 'jane@example.com',
        name: 'Jane Smith',
        password: await bcrypt.hash('password123', 10),
        settings: {
          create: {
            theme: 'dark',
            emailNotifications: false,
            reminderTime: new Date(new Date().setHours(20, 0, 0, 0)), // 8 PM reminder
          }
        },
        profile: {
          create: {
            bio: 'Fitness enthusiast and lifelong learner',
            birthdate: new Date('1992-06-23'),
            location: 'New York, NY',
            occupation: 'Personal Trainer',
            interests: ['fitness', 'nutrition', 'reading']
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
      }
    }),
    prisma.category.create({
      data: {
        userId: john.id,
        name: 'Work',
        color: '#33FF57',
      }
    }),
    prisma.category.create({
      data: {
        userId: john.id,
        name: 'Travel',
        color: '#3357FF',
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
      }
    }),
    prisma.category.create({
      data: {
        userId: jane.id,
        name: 'Learning',
        color: '#33FFF5',
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
        categories: {
          connect: [{ id: johnCategories[1].id }] // Work category
        },
        metadata: {
          create: {
            wordCount: 37,
            readingTime: 1
          }
        }
      }
    }),
    prisma.journalEntry.create({
      data: {
        userId: john.id,
        title: 'Weekend Trip to the Mountains',
        content: 'Spent the weekend hiking in the mountains. The views were breathtaking, and the fresh air was exactly what I needed. Reached the summit after a challenging 4-hour hike. Made some great memories and took plenty of photos.',
        categories: {
          connect: [{ id: johnCategories[2].id }] // Travel category
        },
        metadata: {
          create: {
            wordCount: 42,
            readingTime: 1
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
        categories: {
          connect: [{ id: janeCategories[0].id }] // Fitness category
        },
        metadata: {
          create: {
            wordCount: 39,
            readingTime: 1
          }
        }
      }
    }),
    prisma.journalEntry.create({
      data: {
        userId: jane.id,
        title: 'TypeScript Course Progress',
        content: 'Completed the advanced TypeScript course today. The sections on generics and utility types were particularly enlightening. Starting to see how powerful the type system can be. Next up: diving into design patterns.',
        categories: {
          connect: [{ id: janeCategories[1].id }] // Learning category
        },
        metadata: {
          create: {
            wordCount: 35,
            readingTime: 1
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