import { PrismaClient } from '@prisma/client';
import { SentimentService } from '../src/services/sentiment.service';

const prisma = new PrismaClient();

async function main() {
  // Get all journal entries
  const entries = await prisma.journalEntry.findMany({
    include: {
      metadata: true
    }
  });

  console.log(`Found ${entries.length} entries to analyze`);

  // Analyze sentiment for each entry
  for (const entry of entries) {
    console.log(`Analyzing entry ${entry.id}`);
    
    // Use SentimentService to analyze sentiment
    const result = await SentimentService.analyzeSentiment(entry.id);
    
    console.log(`Entry ${entry.id} analyzed:`, {
      score: result.score,
      magnitude: result.magnitude,
      mood: result.mood
    });
  }

  console.log('Sentiment analysis completed');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 