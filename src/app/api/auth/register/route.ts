import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { createErrorResponse } from '@/lib/api';
import { validateRequest, registerSchema } from '@/lib/validation';
import { DuplicateError, ValidationError } from '@/lib/errors';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 30, // 30 seconds
};

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = await validateRequest(registerSchema, body);
    
    // Register user
    const user = await AuthService.register(validatedData);

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return createErrorResponse({
        status: 400,
        message: error.message,
        field: error.field
      });
    }

    if (error instanceof DuplicateError) {
      return createErrorResponse({
        status: 409,
        message: error.message
      });
    }

    return createErrorResponse({
      status: 500,
      message: 'An unexpected error occurred during registration'
    });
  }
} 