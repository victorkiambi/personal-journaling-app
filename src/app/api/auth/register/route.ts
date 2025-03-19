import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { handleApiError } from '@/app/api/middleware';
import { validateRequest, registerSchema, sanitizeText, handleValidationError } from '@/lib/validation';

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
    const validatedData = await validateRequest(registerSchema, body);
    
    // Sanitize input
    const sanitizedName = sanitizeText(validatedData.name);

    const user = await AuthService.register({
      ...validatedData,
      name: sanitizedName,
    });

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    return handleValidationError(error);
  }
} 