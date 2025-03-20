import natural from 'natural';

// Initialize NLP tools
export const tokenizer = new natural.WordTokenizer();
export const tfidf = new natural.TfIdf();
export const analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');

/**
 * Calculate readability score (Flesch Reading Ease)
 */
export function calculateReadability(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const syllables = words.reduce((acc, word) => acc + countSyllables(word), 0);
  
  return 206.835 - 1.015 * (words.length / sentences.length) - 84.6 * (syllables / words.length);
}

/**
 * Count syllables in a word
 */
export function countSyllables(word: string): number {
  word = word.toLowerCase();
  word = word.replace(/[^a-z]/g, '');
  const vowels = word.match(/[aeiouy]+/g);
  return vowels ? vowels.length : 0;
}

/**
 * Calculate complexity score based on word length
 */
export function calculateComplexity(text: string): number {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const longWords = words.filter(w => w.length > 6).length;
  
  return (longWords / words.length) * 10;
}

/**
 * Get emotion from sentiment score
 */
export function getEmotionFromSentiment(score: number): string {
  if (score > 0.5) return 'joy';
  if (score > 0) return 'contentment';
  if (score === 0) return 'neutral';
  if (score > -0.5) return 'sadness';
  return 'anger';
}

/**
 * Detect time of day from content
 */
export function detectTimeOfDay(content: string): string {
  const morningWords = ['morning', 'breakfast', 'wake', 'early'];
  const eveningWords = ['evening', 'dinner', 'night', 'late'];
  const afternoonWords = ['afternoon', 'lunch', 'midday'];

  const words = content.toLowerCase().split(/\s+/);
  const morningCount = morningWords.filter(word => words.includes(word)).length;
  const eveningCount = eveningWords.filter(word => words.includes(word)).length;
  const afternoonCount = afternoonWords.filter(word => words.includes(word)).length;

  if (morningCount > eveningCount && morningCount > afternoonCount) return 'morning';
  if (eveningCount > morningCount && eveningCount > afternoonCount) return 'evening';
  if (afternoonCount > morningCount && afternoonCount > eveningCount) return 'afternoon';
  return 'unknown';
}

/**
 * Extract themes from text using TF-IDF
 */
export function extractThemes(text: string, count: number = 5): string[] {
  const tfidf = new natural.TfIdf();
  tfidf.addDocument(text);
  return tfidf.listTerms(0).slice(0, count).map(term => term.term);
}

/**
 * Generate a summary from text using TF-IDF
 */
export function generateSummary(text: string, sentenceCount: number = 3): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const tfidf = new natural.TfIdf();
  
  sentences.forEach(sentence => tfidf.addDocument(sentence));

  return sentences
    .map((sentence, index) => ({
      sentence,
      score: tfidf.tfidf(sentence, 0)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, sentenceCount)
    .map(s => s.sentence)
    .join(' ');
} 