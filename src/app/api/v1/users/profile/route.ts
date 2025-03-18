import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { withAuth, handleApiError } from '@/app/api/middleware';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  return withAuth(request, async (userId) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          preferences: {
            select: {
              id: true,
              theme: true,
              emailNotifications: true,
            },
          },
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
      const { name } = body;

      if (!name?.trim()) {
        return NextResponse.json(
          { message: 'Name is required' },
          { status: 400 }
        );
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: { name },
        select: {
          id: true,
          name: true,
          email: true,
          preferences: {
            select: {
              id: true,
              theme: true,
              emailNotifications: true,
            },
          },
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