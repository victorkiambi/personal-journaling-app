/**
 * Calculates the word count of a given text, handling HTML content.
 * @param text The text to analyze, which may contain HTML tags
 * @returns The number of words in the text
 */
export function calculateWordCount(text: string): number {
  // Remove HTML tags
  const plainText = text.replace(/<[^>]*>/g, ' ');
  
  // Remove special characters and extra spaces
  const cleanText = plainText
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Split by spaces and filter out empty strings
  const words = cleanText.split(' ').filter(word => word.length > 0);
  
  return words.length;
}

/**
 * Calculates the estimated reading time in minutes based on word count.
 * Uses an average reading speed of 200 words per minute.
 * @param wordCount The number of words in the text
 * @returns The estimated reading time in minutes
 */
export function calculateReadingTime(wordCount: number): number {
  const WORDS_PER_MINUTE = 200;
  return Math.ceil(wordCount / WORDS_PER_MINUTE);
}

/**
 * Extracts a summary from the text, handling HTML content.
 * @param text The text to summarize, which may contain HTML tags
 * @param maxLength The maximum length of the summary in characters
 * @returns A summary of the text
 */
export function extractSummary(text: string, maxLength: number = 150): string {
  // Remove HTML tags
  const plainText = text.replace(/<[^>]*>/g, ' ');
  
  // Remove special characters and extra spaces
  const cleanText = plainText
    .replace(/\s+/g, ' ')
    .trim();
  
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  
  // Find the last complete word within maxLength
  const truncated = cleanText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return truncated.substring(0, lastSpace) + '...';
}

/**
 * Analyzes the sentiment of the text using a basic approach.
 * This is a simple implementation and should be replaced with a proper NLP solution for production use.
 * @param text The text to analyze
 * @returns A sentiment score between -1 (negative) and 1 (positive)
 */
export function analyzeSentiment(text: string): number {
  const positiveWords = new Set([
    'happy', 'good', 'great', 'excellent', 'wonderful', 'amazing', 'love',
    'joy', 'excited', 'peaceful', 'grateful', 'thankful', 'blessed',
    'accomplished', 'proud', 'confident', 'optimistic', 'hopeful'
  ]);
  
  const negativeWords = new Set([
    'sad', 'bad', 'terrible', 'awful', 'horrible', 'hate', 'angry',
    'upset', 'frustrated', 'disappointed', 'worried', 'anxious', 'stressed',
    'depressed', 'lonely', 'tired', 'exhausted', 'overwhelmed'
  ]);
  
  // Remove HTML tags and clean text
  const plainText = text.replace(/<[^>]*>/g, ' ').toLowerCase();
  const words = plainText.split(/\W+/);
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.has(word)) positiveCount++;
    if (negativeWords.has(word)) negativeCount++;
  });
  
  const totalWords = words.length;
  if (totalWords === 0) return 0;
  
  return (positiveCount - negativeCount) / Math.max(positiveCount + negativeCount, 1);
} 