'use client';

const API_BASE = '/api/v1';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  token?: string | null;
  headers?: Record<string, string>;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    body,
    token,
    headers: customHeaders = {},
  } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    return {
      success: false,
      error: 'An unknown error occurred',
    };
  }
}

// Helper functions for common API operations
export const api = {
  get: <T = any>(endpoint: string, token?: string | null) =>
    apiRequest<T>(endpoint, { token }),

  post: <T = any>(endpoint: string, data: any, token?: string | null) =>
    apiRequest<T>(endpoint, { method: 'POST', body: data, token }),

  put: <T = any>(endpoint: string, data: any, token?: string | null) =>
    apiRequest<T>(endpoint, { method: 'PUT', body: data, token }),

  delete: <T = any>(endpoint: string, token?: string | null) =>
    apiRequest<T>(endpoint, { method: 'DELETE', token }),
}; 