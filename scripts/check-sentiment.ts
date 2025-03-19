import { prisma } from "../src/lib/prisma";

async function checkSentiment() {
  try {
    const entries = await prisma.journalEntry.findMany({
      include: {
        metadata: true,
      },
    });

    console.log(`Found ${entries.length} entries`);
    console.log("\nSentiment Data:");
    entries.forEach((entry) => {
      console.log(`\nEntry: ${entry.title}`);
      console.log(`Sentiment Score: ${entry.metadata?.sentimentScore ?? "No data"}`);
      console.log(`Mood: ${entry.metadata?.mood ?? "No data"}`);
    });
  } catch (error) {
    console.error("Error checking sentiment:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSentiment(); 