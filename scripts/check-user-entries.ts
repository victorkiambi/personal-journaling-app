import { prisma } from "../src/lib/prisma";

async function checkUserEntries() {
  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      }
    });

    console.log(`Found ${users.length} users`);

    // Check entries for each user
    for (const user of users) {
      console.log(`\nChecking entries for user: ${user.email}`);
      
      const entries = await prisma.journalEntry.findMany({
        where: { userId: user.id },
        include: {
          metadata: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      console.log(`Found ${entries.length} entries`);
      
      if (entries.length > 0) {
        console.log('\nSentiment Data:');
        entries.forEach((entry) => {
          console.log(`\nEntry: ${entry.title}`);
          console.log(`Created: ${entry.createdAt}`);
          console.log(`Sentiment Score: ${entry.metadata?.sentimentScore ?? "No data"}`);
          console.log(`Mood: ${entry.metadata?.mood ?? "No data"}`);
        });
      }
    }
  } catch (error) {
    console.error("Error checking user entries:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserEntries(); 