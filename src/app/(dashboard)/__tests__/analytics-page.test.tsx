import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import AnalyticsPage from '../analytics/page'
import { AnalyticsService } from '@/services/analytics.service'

// Mock next-auth
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}))

// Mock auth options
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

// Mock AnalyticsService
jest.mock('@/services/analytics.service', () => ({
  AnalyticsService: {
    getAnalytics: jest.fn(),
  },
}))

describe('AnalyticsPage', () => {
  const mockSession = {
    user: {
      id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
    },
  }

  const mockAnalytics = {
    summary: {
      totalEntries: 10,
      totalWordCount: 2500,
      longestEntry: {
        title: 'My Longest Entry',
        wordCount: 500,
        createdAt: '2024-03-15T12:00:00Z',
      },
      sentiment: {
        averageScore: 0.75,
        moodDistribution: {
          very_positive: 3,
          positive: 4,
          neutral: 2,
          negative: 1,
          very_negative: 0,
        },
      },
    },
    writingStreak: 5,
    averageWordsPerDay: 250,
    categoryDistribution: [
      { category: 'Personal', count: 5, color: '#4ade80' },
      { category: 'Work', count: 3, color: '#f87171' },
      { category: 'Health', count: 2, color: '#60a5fa' },
    ],
    monthlyActivity: [
      {
        month: '2024-03-01',
        entries: 5,
        wordCount: 1000,
      },
      {
        month: '2024-02-01',
        entries: 3,
        wordCount: 800,
      },
      {
        month: '2024-01-01',
        entries: 2,
        wordCount: 700,
      },
    ],
  }

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    const { getServerSession } = jest.requireMock('next-auth')
    getServerSession.mockResolvedValue(mockSession)
    ;(AnalyticsService.getAnalytics as jest.Mock).mockResolvedValue(mockAnalytics)
  })

  it('renders analytics page with all components', async () => {
    const page = await AnalyticsPage()
    render(page)

    // Check page title and description
    expect(screen.getByRole('heading', { level: 1, name: 'Analytics' })).toBeInTheDocument()
    expect(screen.getByText('Track your writing patterns and journal statistics')).toBeInTheDocument()

    // Check summary cards
    expect(screen.getByText('Total Entries')).toBeInTheDocument()
    expect(screen.getByText('Total Words')).toBeInTheDocument()
    expect(screen.getByText('Writing Streak')).toBeInTheDocument()
    expect(screen.getByText('Avg. Words/Day')).toBeInTheDocument()

    // Check summary values
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('2,500')).toBeInTheDocument()
    expect(screen.getByText('5 days')).toBeInTheDocument()
    expect(screen.getByText('250')).toBeInTheDocument()

    // Check sentiment analysis section
    expect(screen.getByText('Sentiment Analysis')).toBeInTheDocument()

    // Check category distribution
    expect(screen.getByText('Category Distribution')).toBeInTheDocument()
    expect(screen.getByText('Personal')).toBeInTheDocument()
    
    // Check category counts
    const personalEntry = screen.getByText((content, element) => {
      return Boolean(element?.textContent === '5 entries' && element?.previousSibling?.textContent?.includes('Personal'))
    })
    expect(personalEntry).toBeInTheDocument()

    // Check longest entry
    expect(screen.getByText('Longest Entry')).toBeInTheDocument()
    expect(screen.getByText('My Longest Entry')).toBeInTheDocument()
    expect(screen.getByText((content) => content.startsWith('500 words'))).toBeInTheDocument()
  })

  it('redirects to login if no session', async () => {
    const { getServerSession } = jest.requireMock('next-auth')
    const { redirect } = jest.requireMock('next/navigation')
    getServerSession.mockResolvedValue(null)
    redirect.mockImplementation(() => {
      throw new Error('redirect')
    })

    await expect(AnalyticsPage()).rejects.toThrow('redirect')
    expect(redirect).toHaveBeenCalledWith('/login')
    expect(AnalyticsService.getAnalytics).not.toHaveBeenCalled()
  })

  it('handles empty analytics data', async () => {
    const emptyAnalytics = {
      summary: {
        totalEntries: 0,
        totalWordCount: 0,
        longestEntry: null,
        sentiment: null,
      },
      writingStreak: 0,
      averageWordsPerDay: 0,
      categoryDistribution: [],
      monthlyActivity: [],
    }

    ;(AnalyticsService.getAnalytics as jest.Mock).mockResolvedValue(emptyAnalytics)

    const page = await AnalyticsPage()
    render(page)

    // Check summary values
    expect(screen.getByText((content, element) => {
      return Boolean(content === '0' && element?.parentElement?.previousElementSibling?.textContent?.includes('Total Entries'))
    })).toBeInTheDocument()

    expect(screen.getByText((content, element) => {
      return Boolean(content === '0' && element?.parentElement?.previousElementSibling?.textContent?.includes('Total Words'))
    })).toBeInTheDocument()

    expect(screen.getByText('0 days')).toBeInTheDocument()

    expect(screen.getByText((content, element) => {
      return Boolean(content === '0' && element?.parentElement?.previousElementSibling?.textContent?.includes('Avg. Words/Day'))
    })).toBeInTheDocument()

    // Check empty state messages
    expect(screen.getByText('Start writing to build your streak')).toBeInTheDocument()
    expect(screen.getByText('No entries yet')).toBeInTheDocument()
  })

  it('calls AnalyticsService with correct parameters', async () => {
    await AnalyticsPage()
    expect(AnalyticsService.getAnalytics).toHaveBeenCalledWith('user123', { timeRange: 'month' })
  })
}) 