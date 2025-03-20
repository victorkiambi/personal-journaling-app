/**
 * Base error class for application errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Error thrown when validation fails
 */
export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

/**
 * Error thrown when database operations fail
 */
export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 'DATABASE_ERROR', 500);
  }
}

/**
 * Error thrown when a resource is not found
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}

/**
 * Error thrown when user is not authorized
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

/**
 * Error thrown when a duplicate resource is found
 */
export class DuplicateError extends AppError {
  constructor(resource: string) {
    super(`${resource} already exists`, 'DUPLICATE', 409);
  }
}

/**
 * Error thrown when an invalid operation is attempted
 */
export class InvalidOperationError extends AppError {
  constructor(message: string) {
    super(message, 'INVALID_OPERATION', 400);
  }
}

/**
 * Error thrown when rate limit is exceeded
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 'RATE_LIMIT', 429);
  }
}

/**
 * Error thrown when a service is unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service unavailable') {
    super(message, 'SERVICE_UNAVAILABLE', 503);
  }
} 