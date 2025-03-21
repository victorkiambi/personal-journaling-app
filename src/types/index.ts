export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type Theme = 'light' | 'dark' | 'system';

export type UserSession = {
  id: string;
  email: string;
  name: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  password: string;
  name: string;
};

export type JournalEntryData = {
  title: string;
  content: string;
  categoryIds?: string[];
};

export type CategoryData = {
  name: string;
  color: string;
  description?: string;
  parentId?: string;
};

export type SettingsData = {
  theme: 'light' | 'dark' | 'system';
  emailNotifications: boolean;
};

export type ProfileData = {
  name: string;
  bio?: string;
  location?: string;
  avatar?: string;
};

export type AnalyticsQuery = {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'all';
}; 