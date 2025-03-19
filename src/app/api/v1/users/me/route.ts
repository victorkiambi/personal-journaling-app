import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth, handleApiError } from '@/app/api/middleware';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  return withAuth(request, async (userId) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          settings: true,
          profile: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }

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
      const { name, bio, location, theme, emailNotifications } = body;

      // Update user
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          profile: {
            upsert: {
              create: { bio, location },
              update: { bio, location },
            },
          },
          settings: {
            upsert: {
              create: { theme, emailNotifications },
              update: { theme, emailNotifications },
            },
          },
        },
        include: {
          settings: true,
          profile: true,
        },
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