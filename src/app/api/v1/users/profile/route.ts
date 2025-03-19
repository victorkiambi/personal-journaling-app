import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';
import { withAuth, handleApiError } from '@/app/api/middleware';
import { validateRequest, profileSchema, sanitizeText, handleValidationError } from '@/lib/validation';

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
      const profile = await UserService.getProfile(userId);
      return NextResponse.json({
        success: true,
        data: profile
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
      const validatedData = await validateRequest(profileSchema, body);
      
      // Sanitize input
      const sanitizedName = sanitizeText(validatedData.name);
      const sanitizedBio = validatedData.bio ? sanitizeText(validatedData.bio) : undefined;

      const profile = await UserService.updateProfile(userId, {
        ...validatedData,
        name: sanitizedName,
        bio: sanitizedBio,
      });

      return NextResponse.json({
        success: true,
        data: profile
      });
    } catch (error) {
      return handleValidationError(error);
    }
  });
} 