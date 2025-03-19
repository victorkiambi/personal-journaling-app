import { render, screen } from '@testing-library/react'
import MonthlyActivityChart from '../monthly-activity-chart'

describe('MonthlyActivityChart', () => {
  const mockData = [
    {
      month: '2024-03-01',
      entries: 5,
      wordCount: 1000,
    },
    {
      month: '2024-02-01',
      entries: 3,
      wordCount: 600,
    },
    {
      month: '2024-01-01',
      entries: 4,
      wordCount: 800,
    },
  ]

  it('renders monthly activity chart', () => {
    render(<MonthlyActivityChart data={mockData} />)
    
    // Check for title and description
    expect(screen.getByText('Monthly Activity')).toBeInTheDocument()
    expect(screen.getByText('Your writing activity over time')).toBeInTheDocument()
    
    // Check for month labels
    expect(screen.getByText('March 2024')).toBeInTheDocument()
    expect(screen.getByText('February 2024')).toBeInTheDocument()
    expect(screen.getByText('January 2024')).toBeInTheDocument()
  })

  it('displays correct entry counts', () => {
    render(<MonthlyActivityChart data={mockData} />)
    
    // Check for entry counts
    expect(screen.getByText('5 entries')).toBeInTheDocument()
    expect(screen.getByText('3 entries')).toBeInTheDocument()
    expect(screen.getByText('4 entries')).toBeInTheDocument()
  })

  it('displays correct word counts', () => {
    render(<MonthlyActivityChart data={mockData} />)
    
    // Check for word counts
    expect(screen.getByText('1,000 words')).toBeInTheDocument()
    expect(screen.getByText('600 words')).toBeInTheDocument()
    expect(screen.getByText('800 words')).toBeInTheDocument()
  })

  it('handles empty data', () => {
    render(<MonthlyActivityChart data={[]} />)
    
    // Check that the component renders without crashing
    expect(screen.getByText('Monthly Activity')).toBeInTheDocument()
  })
}) 