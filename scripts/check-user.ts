import { prisma } from "../src/lib/prisma";

async function checkUser() {
  try {
    // Get all users with their entries and metadata
    const users = await prisma.user.findMany({
      include: {
        journalEntries: {
          include: {
            metadata: true
          }
        }
      }
    });

    users.forEach(user => {
      console.log(`\nUser: ${user.email}`);
      console.log(`ID: ${user.id}`);
      console.log(`Entries: ${user.journalEntries.length}`);
      
      if (user.journalEntries.length > 0) {
        console.log('\nEntries with sentiment:');
        user.journalEntries.forEach(entry => {
          console.log(`\nTitle: ${entry.title}`);
          console.log(`ID: ${entry.id}`);
          console.log(`Created: ${entry.createdAt}`);
          console.log(`Sentiment Score: ${entry.metadata?.sentimentScore}`);
          console.log(`Mood: ${entry.metadata?.mood}`);
        });
      }
    });
  } catch (error) {
    console.error("Error checking user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser(); 