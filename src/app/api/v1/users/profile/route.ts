import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';
import { withAuth, handleApiError } from '@/app/api/middleware';
import { validateRequest, profileSchema } from '@/lib/validation';
import { sanitizeContent } from '@/lib/sanitize';
import type { ProfileData } from '@/types';

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
      
      const profileData: ProfileData = {
        ...validatedData,
        name: sanitizeContent(validatedData.name),
        bio: validatedData.bio ? sanitizeContent(validatedData.bio) : undefined,
        location: validatedData.location ? sanitizeContent(validatedData.location) : undefined
      };

      const profile = await UserService.updateProfile(userId, profileData);

      return NextResponse.json({
        success: true,
        data: profile
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 