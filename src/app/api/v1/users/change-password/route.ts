import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { compare, hash } from 'bcrypt';
import { withAuth, handleApiError } from '@/app/api/middleware';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  return withAuth(request, async (userId) => {
    try {
      const body = await request.json();
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { message: 'Current password and new password are required' },
          { status: 400 }
        );
      }

      // Get user with password hash
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          passwordHash: true,
        },
      });

      if (!user) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }

      // Verify current password
      const passwordMatch = await compare(currentPassword, user.passwordHash);
      if (!passwordMatch) {
        return NextResponse.json(
          { message: 'Current password is incorrect' },
          { status: 401 }
        );
      }

      // Hash new password
      const hashedPassword = await hash(newPassword, 10);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: hashedPassword },
      });

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully'
      });
    } catch (error) {
      return handleApiError(error);
    }
  });
} 