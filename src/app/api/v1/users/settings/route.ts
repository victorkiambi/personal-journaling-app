import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';
import { withAuth, handleApiError } from '@/app/api/middleware';
import { validateRequest, settingsSchema, handleValidationError } from '@/lib/validation';

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
      const settings = await UserService.getSettings(userId);
      return NextResponse.json({
        success: true,
        data: settings
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
      const validatedData = await validateRequest(settingsSchema, body);

      const settings = await UserService.updateSettings(userId, validatedData);

      return NextResponse.json({
        success: true,
        data: settings
      });
    } catch (error) {
      return handleValidationError(error);
    }
  });
} 