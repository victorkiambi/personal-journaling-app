import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { compare, hash } from 'bcryptjs';
import { verifyJWT } from '@/lib/jwt';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Unauthorized: Invalid token format' },
        { status: 401 }
      );
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify the token
    const payload = await verifyJWT(token);
    
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { message: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const passwordMatch = await compare(currentPassword, user.password);
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
      where: { id: payload.userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 