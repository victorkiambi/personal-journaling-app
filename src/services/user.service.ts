import { z } from 'zod';
import { getPrismaClient, withDbError, withTransaction } from '@/lib/db';
import { 
  NotFoundError, 
  DatabaseError 
} from '@/lib/errors';

export class UserService {
  /**
   * Get a user by ID
   */
  static async getUser(userId: string) {
    return withDbError(
      async () => {
        const prisma = getPrismaClient();
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
          throw new NotFoundError('User');
        }

        return user;
      },
      'fetch user'
    );
  }

  /**
   * Update a user's information
   */
  static async updateUser(userId: string, data: z.infer<typeof import('@/lib/validation').userSchema>) {
    return withTransaction(async (prisma) => {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        throw new NotFoundError('User');
      }

      return await prisma.user.update({
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
    }, 'update user');
  }

  /**
   * Get a user's profile
   */
  static async getProfile(userId: string) {
    return withDbError(
      async () => {
        const prisma = getPrismaClient();
        const profile = await prisma.profile.findUnique({
          where: { userId },
        });

        if (!profile) {
          throw new NotFoundError('Profile');
        }

        return profile;
      },
      'fetch profile'
    );
  }

  /**
   * Update a user's profile
   */
  static async updateProfile(userId: string, data: z.infer<typeof import('@/lib/validation').profileSchema>) {
    return withTransaction(async (prisma) => {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        throw new NotFoundError('User');
      }

      return await prisma.profile.upsert({
        where: { userId },
        create: {
          userId,
          ...data,
        },
        update: data,
      });
    }, 'update profile');
  }

  /**
   * Get a user's settings
   */
  static async getSettings(userId: string) {
    return withDbError(
      async () => {
        const prisma = getPrismaClient();
        const settings = await prisma.settings.findUnique({
          where: { userId },
        });

        if (!settings) {
          throw new NotFoundError('Settings');
        }

        return settings;
      },
      'fetch settings'
    );
  }

  /**
   * Update a user's settings
   */
  static async updateSettings(userId: string, data: z.infer<typeof import('@/lib/validation').settingsSchema>) {
    return withTransaction(async (prisma) => {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!existingUser) {
        throw new NotFoundError('User');
      }

      return await prisma.settings.upsert({
        where: { userId },
        create: {
          userId,
          ...data,
        },
        update: data,
      });
    }, 'update settings');
  }
} 