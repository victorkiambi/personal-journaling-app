import { NextResponse } from 'next/server';
import { AppError } from './errors';

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(data: T) {
  return NextResponse.json({
    success: true,
    data,
  });
}

/**
 * Create an error API response
 */
export function createErrorResponse(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.status }
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  );
}

/**
 * Create a paginated API response
 */
export function createPaginatedResponse<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number
) {
  return createSuccessResponse({
    items,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  });
}

/**
 * Create a validation error response
 */
export function createValidationErrorResponse(message: string, field?: string) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'VALIDATION_ERROR',
      field,
    },
    { status: 400 }
  );
}

/**
 * Create a not found error response
 */
export function createNotFoundErrorResponse(resource: string) {
  return NextResponse.json(
    {
      success: false,
      error: `${resource} not found`,
      code: 'NOT_FOUND',
    },
    { status: 404 }
  );
}

/**
 * Create an unauthorized error response
 */
export function createUnauthorizedErrorResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'UNAUTHORIZED',
    },
    { status: 401 }
  );
}

/**
 * Create a duplicate error response
 */
export function createDuplicateErrorResponse(resource: string) {
  return NextResponse.json(
    {
      success: false,
      error: `${resource} already exists`,
      code: 'DUPLICATE',
    },
    { status: 409 }
  );
}

/**
 * Create a rate limit error response
 */
export function createRateLimitErrorResponse(message: string = 'Too many requests') {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'RATE_LIMIT',
    },
    { status: 429 }
  );
}

/**
 * Create a service unavailable error response
 */
export function createServiceUnavailableErrorResponse(
  message: string = 'Service unavailable'
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code: 'SERVICE_UNAVAILABLE',
    },
    { status: 503 }
  );
} 