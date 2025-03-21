import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { handleApiError } from '@/app/api/middleware';
import { validateRequest, loginSchema } from '@/lib/validation';

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
    const body = await request.json();
    
    // Validate request body
    const validatedData = await validateRequest(loginSchema, body);

    const session = await AuthService.login(validatedData);

    return NextResponse.json({
      success: true,
      data: session
    });
  } catch (error) {
    return handleApiError(error);
  }
} 