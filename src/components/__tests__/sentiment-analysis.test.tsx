import { render, screen } from '@testing-library/react'
import SentimentAnalysis from '../sentiment-analysis'

describe('SentimentAnalysis', () => {
  const mockSentiment = {
    averageScore: 0.75,
    moodDistribution: {
      very_positive: 3,
      positive: 4,
      neutral: 2,
      negative: 1,
      very_negative: 0,
    },
  }

  it('renders sentiment analysis component', () => {
    render(<SentimentAnalysis sentiment={mockSentiment} />)
    
    // Check for main sections
    expect(screen.getByText('Overall Sentiment')).toBeInTheDocument()
    expect(screen.getByText('Mood Distribution')).toBeInTheDocument()
    
    // Check for sentiment score
    expect(screen.getByText('0.75')).toBeInTheDocument()
    
    // Check for mood counts
    expect(screen.getByText('3 entries')).toBeInTheDocument()
    expect(screen.getByText('4 entries')).toBeInTheDocument()
    expect(screen.getByText('2 entries')).toBeInTheDocument()
    expect(screen.getByText('1 entries')).toBeInTheDocument()
    expect(screen.getByText('0 entries')).toBeInTheDocument()
  })

  it('displays correct mood colors', () => {
    render(<SentimentAnalysis sentiment={mockSentiment} />)
    
    // Check for mood color indicators
    const veryPositiveIndicator = screen.getByText('Very Positive').closest('div')?.querySelector('.h-3')
    const positiveIndicator = screen.getByText('Positive').closest('div')?.querySelector('.h-3')
    const neutralIndicator = screen.getByText('Neutral').closest('div')?.querySelector('.h-3')
    const negativeIndicator = screen.getByText('Negative').closest('div')?.querySelector('.h-3')
    const veryNegativeIndicator = screen.getByText('Very Negative').closest('div')?.querySelector('.h-3')
    
    expect(veryPositiveIndicator).toBeInTheDocument()
    expect(positiveIndicator).toBeInTheDocument()
    expect(neutralIndicator).toBeInTheDocument()
    expect(negativeIndicator).toBeInTheDocument()
    expect(veryNegativeIndicator).toBeInTheDocument()
  })

  it('handles zero entries', () => {
    const zeroSentiment = {
      averageScore: 0,
      moodDistribution: {
        very_positive: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        very_negative: 0,
      },
    }
    
    render(<SentimentAnalysis sentiment={zeroSentiment} />)
    
    // Check for zero values
    expect(screen.getByText('0.00')).toBeInTheDocument()
    expect(screen.getAllByText('0 entries')).toHaveLength(5)
  })
}) 