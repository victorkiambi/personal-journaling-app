import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/services/auth.service';
import { withAuth, handleApiError } from '@/app/api/middleware';
import { validateRequest, userSchema, sanitizeText, handleValidationError } from '@/lib/validation';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 30, // 30 seconds
};

export async function GET(request: NextRequest) {
  return withAuth(request, async (userId) => {
    try {
      const user = await AuthService.getCurrentUser(userId);
      return NextResponse.json({
        success: true,
        data: user
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
}

export async function PUT(request: NextRequest) {
  return withAuth(request, async (userId) => {
    try {
      const body = await request.json();
      
      // Validate request body
      const validatedData = await validateRequest(userSchema, body);
      
      // Sanitize input
      const sanitizedName = sanitizeText(validatedData.name);

      const user = await AuthService.updateCurrentUser(userId, {
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
  });
} 