import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';
import { withAuth, handleApiError } from '@/app/api/middleware';
import { validateRequest, changePasswordSchema, handleValidationError } from '@/lib/validation';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
  maxDuration: 30, // 30 seconds
};

export async function POST(request: NextRequest) {
  return withAuth(request, async (userId) => {
    try {
      const body = await request.json();
      
      // Validate request body
      const validatedData = await validateRequest(changePasswordSchema, body);

      await UserService.changePassword(userId, validatedData);

      return NextResponse.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error: any) {
      // Handle validation errors
      if (error.name === 'ValidationError' || error.name === 'ZodError') {
        return handleValidationError(error);
      }
      
      // Handle other errors
      return handleApiError(error);
    }
  });
} 