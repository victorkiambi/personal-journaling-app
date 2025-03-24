import { z } from 'zod';
import { AppError } from './errors';

// Base schemas
export const baseIdSchema = z.string().cuid();
export const baseDateSchema = z.date();

// User schemas
export const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  bio: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  emailNotifications: z.boolean().optional(),
});

export const registerSchema = userSchema.extend({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

// Journal Entry schemas
export const journalEntrySchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(1, 'Content is required'),
  categoryId: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  metadata: z.object({
    wordCount: z.number().optional(),
    readingTime: z.number().optional(),
    mood: z.string().optional(),
    weather: z.string().optional(),
  }).optional(),
});

// Category schemas
export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
  description: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
  color: z.string().optional(),
});

// Profile schemas
export const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  bio: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
});

// Settings schemas
export const settingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  emailNotifications: z.boolean(),
});

// Analytics query schema
export const analyticsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.string().optional(),
  timeRange: z.enum(['day', 'week', 'month', 'year', 'all']).default('week'),
});

// Validation error handling
export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export function handleValidationError(error: unknown): Response {
  if (error instanceof Error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  return new Response(
    JSON.stringify({
      success: false,
      message: 'An unexpected error occurred',
    }),
    {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

// API validation middleware
export async function validateRequest<T extends z.ZodType>(
  schema: T,
  data: unknown
): Promise<z.infer<T>> {
  try {
    return await schema.parseAsync(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError(error.errors.map(e => e.message).join(', '));
    }
    throw error;
  }
} 