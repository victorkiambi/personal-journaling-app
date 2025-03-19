import { prisma } from '@/lib/prisma';
import { SentimentService } from '../services/sentiment.service';

async function testSentimentAnalysis() {
  try {
    // Create a test user if it doesn't exist
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        password: 'test-password-hash' // In a real app, this would be properly hashed
      }
    });

    // Test with different types of text
    const testTexts = [
      "I am very happy and excited about this project!",
      "This is a neutral statement about the weather.",
      "I'm feeling quite sad and disappointed today."
    ];

    for (const testText of testTexts) {
      console.log('\nTesting text:', testText);
      
      // Create a temporary entry in the database
      const entry = await prisma.journalEntry.create({
        data: {
          title: "Test Entry",
          content: testText,
          userId: testUser.id,
          metadata: {
            create: {
              wordCount: testText.split(/\s+/).length,
              readingTime: Math.ceil(testText.split(/\s+/).length / 200)
            }
          }
        }
      });

      // Analyze sentiment
      const result = await SentimentService.analyzeSentiment(entry.id);
      
      console.log('Sentiment Analysis Result:', {
        score: result.score.toFixed(2),
        magnitude: result.magnitude.toFixed(2),
        mood: result.mood,
        sentences: result.sentences.map(s => ({
          content: s.content,
          score: s.score.toFixed(2)
        }))
      });
      
      // Clean up
      await prisma.journalEntry.delete({
        where: { id: entry.id }
      });
    }
    
    // Clean up test user
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Error testing sentiment analysis:', error);
  }
}

testSentimentAnalysis(); 