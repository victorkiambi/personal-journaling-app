import { getPrismaClient, withDbError, withTransaction } from '@/lib/db';
import { hash, compare } from 'bcrypt';
import { z } from 'zod';
import { registerSchema, loginSchema, userSchema } from '@/lib/validation';
import { DuplicateError, NotFoundError, UnauthorizedError } from '@/lib/errors';

export class AuthService {
  private static prisma = getPrismaClient();

  static async register(data: z.infer<typeof registerSchema>) {
    return withTransaction(async (tx) => {
      const { email, password, name } = data;

      // Check if user already exists
      const existingUser = await withDbError(
        () => tx.user.findUnique({
          where: { email },
          select: { id: true }
        }),
        'Failed to check for existing user'
      );

      if (existingUser) {
        throw new DuplicateError('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await hash(password, 10);

      // Create user with profile and settings
      const user = await withDbError(
        () => tx.user.create({
          data: {
            email,
            name,
            password: hashedPassword,
            profile: {
              create: {
                bio: null,
                location: null
              }
            },
            settings: {
              create: {
                theme: 'system',
                emailNotifications: true
              }
            }
          },
          select: {
            id: true,
            email: true,
            name: true,
          },
        }),
        'Failed to create user'
      );

      return user;
    }, 'register user');
  }

  static async login(data: z.infer<typeof loginSchema>) {
    const { email, password } = data;

    // Find user
    const user = await withDbError(
      () => this.prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
        },
      }),
      'Failed to find user'
    );

    if (!user || !user.password) {
      throw new NotFoundError('User not found');
    }

    // Verify password
    const isValid = await compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  static async changePassword(userId: string, currentPassword: string, newPassword: string) {
    return withTransaction(async (tx) => {
      // Find user
      const user = await withDbError(
        () => tx.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            password: true,
          },
        }),
        'Failed to find user'
      );

      if (!user || !user.password) {
        throw new NotFoundError('User not found');
      }

      // Verify current password
      const isValid = await compare(currentPassword, user.password);
      if (!isValid) {
        throw new UnauthorizedError('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await hash(newPassword, 10);

      // Update password
      await withDbError(
        () => tx.user.update({
          where: { id: userId },
          data: { password: hashedPassword },
        }),
        'Failed to update password'
      );
    }, 'change password');
  }

  static async getCurrentUser(userId: string) {
    const user = await withDbError(
      () => this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          settings: true,
          profile: true,
        },
      }),
      'Failed to get current user'
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  static async updateCurrentUser(userId: string, data: z.infer<typeof userSchema>) {
    return withDbError(
      () => this.prisma.user.update({
        where: { id: userId },
        data: {
          name: data.name,
          settings: {
            upsert: {
              create: {
                theme: data.theme || 'system',
                emailNotifications: data.emailNotifications || false,
              },
              update: {
                theme: data.theme || 'system',
                emailNotifications: data.emailNotifications || false,
              },
            },
          },
          profile: {
            upsert: {
              create: {
                bio: data.bio || null,
                location: data.location || null,
              },
              update: {
                bio: data.bio || null,
                location: data.location || null,
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
      }),
      'Failed to update user'
    );
  }
} 