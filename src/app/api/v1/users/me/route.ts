import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/services/user.service';
import { withAuth, handleApiError } from '@/app/api/middleware';
import { validateRequest, userSchema } from '@/lib/validation';
import { sanitizeContent } from '@/lib/sanitize';

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
      const user = await UserService.getUser(userId);
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
      
      const user = await UserService.updateUser(userId, {
        ...validatedData,
        name: sanitizeContent(validatedData.name),
        bio: validatedData.bio ? sanitizeContent(validatedData.bio) : undefined,
        location: validatedData.location ? sanitizeContent(validatedData.location) : undefined
      });

      return NextResponse.json({
        success: true,
        data: user
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 