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
  isPublic?: boolean;
  categoryIds?: string[];
};

export type CategoryData = {
  name: string;
  color: string;
  description?: string;
  parentId?: string;
}; 