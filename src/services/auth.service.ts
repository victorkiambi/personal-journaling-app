import { prisma } from '@/lib/prisma';
import { hash, compare } from 'bcrypt';
import { z } from 'zod';

export class AuthService {
  static async register(data: z.infer<typeof import('@/lib/validation').registerSchema>) {
    const { email, password, name } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return user;
  }

  static async login(data: z.infer<typeof import('@/lib/validation').loginSchema>) {
    const { email, password } = data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await compare(password, user.password || '');

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  static async changePassword(userId: string, data: z.infer<typeof import('@/lib/validation').changePasswordSchema>) {
    const { currentPassword, newPassword } = data;

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await compare(currentPassword, user.password || '');

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        settings: true,
        profile: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  static async updateCurrentUser(userId: string, data: z.infer<typeof import('@/lib/validation').userSchema>) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        settings: {
          upsert: {
            create: {
              theme: data.theme,
              emailNotifications: data.emailNotifications,
            },
            update: {
              theme: data.theme,
              emailNotifications: data.emailNotifications,
            },
          },
        },
        profile: {
          upsert: {
            create: {
              bio: data.bio,
              location: data.location,
            },
            update: {
              bio: data.bio,
              location: data.location,
            },
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        settings: true,
        profile: true,
      },
    });

    return user;
  }
} 