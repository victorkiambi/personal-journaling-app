import { render, screen } from '@testing-library/react'
import SentimentAnalysis from '../sentiment-analysis'

describe('SentimentAnalysis', () => {
  const mockSentiment = {
    averageScore: 0.6,
    moodDistribution: {
      very_positive: 3,
      positive: 2,
      neutral: 2,
      negative: 2,
      very_negative: 1
    }
  }

  it('renders empty state when no sentiment data is provided', () => {
    render(<SentimentAnalysis sentiment={null} />)
    expect(screen.getByText('No sentiment data available')).toBeInTheDocument()
  })

  it('renders overall sentiment card with correct score and description', () => {
    render(<SentimentAnalysis sentiment={mockSentiment} />)
    
    // Check for overall sentiment title
    expect(screen.getByText('Overall Sentiment')).toBeInTheDocument()
    
    // Check for sentiment score
    expect(screen.getByText('0.60')).toBeInTheDocument()
    
    // Check for sentiment description
    expect(screen.getByText('Very positive overall sentiment')).toBeInTheDocument()
  })

  it('renders mood distribution card with correct title', () => {
    render(<SentimentAnalysis sentiment={mockSentiment} />)
    expect(screen.getByText('Mood Distribution')).toBeInTheDocument()
  })

  it('renders all mood labels', () => {
    render(<SentimentAnalysis sentiment={mockSentiment} />)
    
    // Check for all mood labels
    expect(screen.getByText('Very Positive')).toBeInTheDocument()
    expect(screen.getByText('Positive')).toBeInTheDocument()
    expect(screen.getByText('Neutral')).toBeInTheDocument()
    expect(screen.getByText('Negative')).toBeInTheDocument()
    expect(screen.getByText('Very Negative')).toBeInTheDocument()
  })

  it('renders correct entry counts and percentages', () => {
    render(<SentimentAnalysis sentiment={mockSentiment} />)
    
    // Check entry counts
    expect(screen.getByText('3 entries')).toBeInTheDocument()
    expect(screen.getAllByText('2 entries')).toHaveLength(3)
    expect(screen.getByText('1 entries')).toBeInTheDocument()
    
    // Check percentages
    expect(screen.getByText('(30%)')).toBeInTheDocument()
    expect(screen.getAllByText('(20%)')).toHaveLength(3)
    expect(screen.getByText('(10%)')).toBeInTheDocument()
  })
}) 