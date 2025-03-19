import { prisma } from "../src/lib/prisma";

async function checkMetadata() {
  try {
    // Get all metadata entries with their journal entries
    const metadata = await prisma.entryMetadata.findMany({
      include: {
        entry: {
          select: {
            id: true,
            title: true,
            userId: true,
            user: {
              select: {
                email: true
              }
            }
          }
        }
      }
    });

    console.log(`Found ${metadata.length} metadata entries`);

    // Group by user
    const userMetadata = metadata.reduce((acc, meta) => {
      const email = meta.entry.user.email;
      if (!acc[email]) {
        acc[email] = [];
      }
      acc[email].push(meta);
      return acc;
    }, {} as Record<string, typeof metadata>);

    // Print metadata by user
    for (const [email, entries] of Object.entries(userMetadata)) {
      console.log(`\nUser: ${email}`);
      console.log(`Found ${entries.length} entries with metadata`);
      
      entries.forEach(meta => {
        console.log(`\nEntry: ${meta.entry.title}`);
        console.log(`Entry ID: ${meta.entry.id}`);
        console.log(`Word Count: ${meta.wordCount}`);
        console.log(`Reading Time: ${meta.readingTime}`);
        console.log(`Sentiment Score: ${meta.sentimentScore}`);
        console.log(`Sentiment Magnitude: ${meta.sentimentMagnitude}`);
        console.log(`Mood: ${meta.mood}`);
      });
    }
  } catch (error) {
    console.error("Error checking metadata:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkMetadata(); 