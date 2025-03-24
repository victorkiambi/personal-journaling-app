import { AuthService } from '../auth.service';
import { prismaMock } from '../../lib/__mocks__/prisma';
import { hash, compare } from 'bcryptjs';
import { DuplicateError, NotFoundError, UnauthorizedError, DatabaseError } from '@/lib/errors';

jest.mock('bcryptjs');

describe('AuthService', () => {
  const mockUser = {
    email: 'test@example.com',
    password: 'Test123!',
    name: 'Test User',
  };

  const mockCreatedUser = {
    id: '1',
    email: mockUser.email,
    name: mockUser.name,
    password: 'hashedPassword',
  };

  const mockCredentials = {
    email: mockUser.email,
    password: mockUser.password,
  };

  const mockData = {
    userId: '1',
    currentPassword: 'CurrentPass123!',
    newPassword: 'NewPass123!',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prismaMock.user.create as jest.Mock).mockResolvedValue(mockCreatedUser);
      (prismaMock.profile.create as jest.Mock).mockResolvedValue({ id: '1' });
      (prismaMock.settings.create as jest.Mock).mockResolvedValue({ id: '1' });

      const result = await AuthService.register(mockUser);

      expect(result).toEqual({
        id: mockCreatedUser.id,
        email: mockCreatedUser.email,
        name: mockCreatedUser.name,
      });
      expect(hash).toHaveBeenCalledWith(mockUser.password, 10);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          email: mockUser.email,
          name: mockUser.name,
          password: 'hashedPassword',
        },
      });
    });

    it('should throw DuplicateError if user already exists', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockCreatedUser);

      await expect(AuthService.register(mockUser)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should handle database errors during registration', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);
      (hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prismaMock.user.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(AuthService.register(mockUser)).rejects.toThrow(
        'Failed to create user'
      );
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockCreatedUser);
      (compare as jest.Mock).mockResolvedValue(true);

      const result = await AuthService.login(mockCredentials);

      expect(result).toEqual({
        id: mockCreatedUser.id,
        email: mockCreatedUser.email,
        name: mockCreatedUser.name,
      });
      expect(compare).toHaveBeenCalledWith(
        mockCredentials.password,
        mockCreatedUser.password
      );
    });

    it('should throw NotFoundError if user does not exist', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(AuthService.login(mockCredentials)).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw UnauthorizedError if password is incorrect', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockCreatedUser);
      (compare as jest.Mock).mockResolvedValue(false);

      await expect(AuthService.login(mockCredentials)).rejects.toThrow(
        'Invalid credentials'
      );
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockCreatedUser);
      (compare as jest.Mock).mockResolvedValue(true);
      (hash as jest.Mock).mockResolvedValue('newHashedPassword');
      (prismaMock.user.update as jest.Mock).mockResolvedValue(mockCreatedUser);

      await AuthService.changePassword(mockData);

      expect(compare).toHaveBeenCalledWith(
        mockData.currentPassword,
        mockCreatedUser.password
      );
      expect(hash).toHaveBeenCalledWith(mockData.newPassword, 10);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: mockData.userId },
        data: { password: 'newHashedPassword' },
      });
    });

    it('should throw NotFoundError if user does not exist', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(AuthService.changePassword(mockData)).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw UnauthorizedError if current password is incorrect', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockCreatedUser);
      (compare as jest.Mock).mockResolvedValue(false);

      await expect(AuthService.changePassword(mockData)).rejects.toThrow(
        'Current password is incorrect'
      );
    });

    it('should handle database errors during password change', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockCreatedUser);
      (compare as jest.Mock).mockResolvedValue(true);
      (hash as jest.Mock).mockResolvedValue('newHashedPassword');
      (prismaMock.user.update as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(AuthService.changePassword(mockData)).rejects.toThrow(
        'Failed to update password'
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should get current user successfully', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await AuthService.getCurrentUser('1');

      expect(result).toEqual(mockCreatedUser);
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundError if user does not exist', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(AuthService.getCurrentUser('1')).rejects.toThrow(
        'User not found'
      );
    });
  });

  describe('updateCurrentUser', () => {
    it('should update user successfully', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockCreatedUser);
      (prismaMock.user.update as jest.Mock).mockResolvedValue(mockCreatedUser);

      const result = await AuthService.updateCurrentUser({
        userId: '1',
        name: 'Updated Name',
      });

      expect(result).toEqual(mockCreatedUser);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated Name' },
      });
    });

    it('should throw NotFoundError if user does not exist', async () => {
      (prismaMock.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        AuthService.updateCurrentUser({
          userId: '1',
          name: 'Updated Name',
        })
      ).rejects.toThrow('User not found');
    });
  });
}); 