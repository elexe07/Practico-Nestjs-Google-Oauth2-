import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { User } from '../users/entities/user.entity.js';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Partial<Record<keyof UsersService, any>>;
  let jwtService: Partial<Record<keyof JwtService, any>>;

  const mockUser: User = {
    id: 'user-uuid-123',
    email: 'test@example.com',
    firstName: 'Maria',
    lastName: 'Lopez',
    picture: 'http://pic.com/avatar.jpg',
    googleId: 'google-uid-999',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    usersService = {
      findByGoogleId: vi.fn(),
      findByEmail: vi.fn(),
      updateUser: vi.fn(),
      updateGoogleId: vi.fn(),
      createGoogleUser: vi.fn(),
    };

    jwtService = {
      signAsync: vi.fn().mockResolvedValue('jwt-mock-token-xyz'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('debe estar definido', () => {
    expect(authService).toBeDefined();
  });

  describe('validateGoogleUser', () => {
    const googleProfile = {
      googleId: 'google-uid-999',
      email: 'test@example.com',
      firstName: 'Maria',
      lastName: 'Lopez',
      picture: 'http://pic.com/avatar.jpg',
    };

    it('Caso 1: Si el usuario ya existe por googleId, actualiza el perfil y retorna el usuario con su JWT', async () => {
      usersService.findByGoogleId.mockResolvedValue(mockUser);
      usersService.updateUser.mockResolvedValue(mockUser);

      const result = await authService.validateGoogleUser(googleProfile);

      expect(usersService.findByGoogleId).toHaveBeenCalledWith('google-uid-999');
      expect(usersService.updateUser).toHaveBeenCalled();
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result.jwt).toBe('jwt-mock-token-xyz');
      expect(result.id).toBe(mockUser.id);
    });

    it('Caso 2: Si no existe por googleId pero el email ya existe, vincula el googleId y retorna con JWT', async () => {
      usersService.findByGoogleId.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue(mockUser);
      usersService.updateGoogleId.mockResolvedValue(mockUser);

      const result = await authService.validateGoogleUser(googleProfile);

      expect(usersService.findByGoogleId).toHaveBeenCalledWith('google-uid-999');
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(usersService.updateGoogleId).toHaveBeenCalledWith(mockUser.id, 'google-uid-999', {
        firstName: googleProfile.firstName,
        lastName: googleProfile.lastName,
        picture: googleProfile.picture,
      });
      expect(result.jwt).toBe('jwt-mock-token-xyz');
    });

    it('Caso 3: Si no existe por googleId ni por email, crea un nuevo usuario y retorna con JWT', async () => {
      usersService.findByGoogleId.mockResolvedValue(null);
      usersService.findByEmail.mockResolvedValue(null);
      usersService.createGoogleUser.mockResolvedValue(mockUser);

      const result = await authService.validateGoogleUser(googleProfile);

      expect(usersService.findByGoogleId).toHaveBeenCalledWith('google-uid-999');
      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(usersService.createGoogleUser).toHaveBeenCalledWith(googleProfile);
      expect(result.jwt).toBe('jwt-mock-token-xyz');
    });

    it('Caso 4: Si el perfil no contiene un email, lanza BadRequestException', async () => {
      await expect(
        authService.validateGoogleUser({ googleId: '123', email: '' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateJwt', () => {
    it('debe firmar el token con id y email', async () => {
      const token = await authService.generateJwt({ id: 'uuid-1', email: 'user@test.com' });
      expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 'uuid-1', email: 'user@test.com' });
      expect(token).toBe('jwt-mock-token-xyz');
    });
  });
});
