import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export class UserService {
  static async getUser(userId: string) {
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

  static async updateUser(userId: string, data: z.infer<typeof import('@/lib/validation').userSchema>) {
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

  static async getProfile(userId: string) {
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error('Profile not found');
    }

    return profile;
  }

  static async updateProfile(userId: string, data: z.infer<typeof import('@/lib/validation').profileSchema>) {
    const profile = await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });

    return profile;
  }

  static async getSettings(userId: string) {
    const settings = await prisma.settings.findUnique({
      where: { userId },
    });

    if (!settings) {
      throw new Error('Settings not found');
    }

    return settings;
  }

  static async updateSettings(userId: string, data: z.infer<typeof import('@/lib/validation').settingsSchema>) {
    const settings = await prisma.settings.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });

    return settings;
  }
} 