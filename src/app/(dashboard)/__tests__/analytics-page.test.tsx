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
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  }

  const mockAnalytics = {
    summary: {
      totalEntries: 10,
      totalWordCount: 2500,
      currentStreak: 5,
      avgWordsPerDay: 250,
      avgWordCount: 250,
      longestEntry: {
        id: 'entry123',
        title: 'My Longest Entry',
        wordCount: 500,
        date: '2024-03-20T12:00:00Z',
      },
    },
    sentiment: {
      average: 0.7,
      distribution: {
        very_positive: 3,
        positive: 4,
        neutral: 2,
        negative: 1,
        very_negative: 0,
      }
    },
    categories: [
      {
        category: 'Personal',
        count: 5,
        color: '#4ade80',
      },
    ],
    monthlyActivity: [
      {
        month: '2024-03',
        entries: 10,
        wordCount: 2500,
      },
    ],
  }

  beforeEach(() => {
    const { getServerSession } = jest.requireMock('next-auth')
    getServerSession.mockResolvedValue(mockSession)
    ;(AnalyticsService.getAnalytics as jest.Mock).mockResolvedValue(mockAnalytics)
  })

  afterEach(() => {
    jest.clearAllMocks()
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
    expect(screen.getByText('5 entries')).toBeInTheDocument()

    // Check longest entry
    expect(screen.getByText('Longest Entry')).toBeInTheDocument()
    expect(screen.getByText('My Longest Entry')).toBeInTheDocument()
    const longestEntryText = screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'p' && content.includes('500 words') && content.includes('Mar 20, 2024')
    })
    expect(longestEntryText).toBeInTheDocument()
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
        currentStreak: 0,
        avgWordsPerDay: 0,
        avgWordCount: 0,
        longestEntry: null,
      },
      sentiment: null,
      categories: [],
      monthlyActivity: [],
    }

    ;(AnalyticsService.getAnalytics as jest.Mock).mockResolvedValue(emptyAnalytics)

    const page = await AnalyticsPage()
    render(page)

    // Check summary values for empty state
    expect(screen.getByText('0', { selector: '[data-testid="total-entries"]' })).toBeInTheDocument()
    expect(screen.getByText('0', { selector: '[data-testid="total-words"]' })).toBeInTheDocument()
    expect(screen.getByText('0 days')).toBeInTheDocument()
    expect(screen.getByText('0', { selector: '[data-testid="avg-words"]' })).toBeInTheDocument()

    // Check empty state messages
    expect(screen.getByText('Start writing to build your streak')).toBeInTheDocument()
    expect(screen.getByText('No entries yet')).toBeInTheDocument()
  })

  it('calls AnalyticsService with correct parameters', async () => {
    await AnalyticsPage()
    expect(AnalyticsService.getAnalytics).toHaveBeenCalledWith('user123', { timeRange: 'month' })
  })
}) 