import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { handleApiError } from '@/app/api/middleware';
import { validateRequest, registerSchema } from '@/lib/validation';

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
    return handleApiError(error);
  }
} 