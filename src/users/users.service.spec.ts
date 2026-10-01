import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service.js';
import { User } from './entities/user.entity.js';
import { BadRequestException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: any;

  const mockUser: User = {
    id: 'uuid-1234',
    email: 'test@example.com',
    firstName: 'Juan',
    lastName: 'Perez',
    picture: 'http://photo.com/123.jpg',
    googleId: 'google-1234',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    mockRepository = {
      findOne: vi.fn(),
      create: vi.fn(),
      save: vi.fn(),
      update: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findByGoogleId', () => {
    it('debe retornar el usuario si existe por googleId', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findByGoogleId('google-1234');
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { googleId: 'google-1234' } });
      expect(result).toEqual(mockUser);
    });

    it('debe retornar null si no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const result = await service.findByGoogleId('google-inexistente');
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('debe retornar el usuario si existe por email', async () => {
      mockRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findByEmail('test@example.com');
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(result).toEqual(mockUser);
    });
  });

  describe('createGoogleUser', () => {
    it('debe crear y retornar un nuevo usuario', async () => {
      const dto = {
        email: 'nuevo@example.com',
        firstName: 'Carlos',
        lastName: 'Gomez',
        picture: 'http://pic.com/1.png',
        googleId: 'google-new',
      };
      mockRepository.create.mockReturnValue(dto);
      mockRepository.save.mockResolvedValue({ id: 'new-uuid', ...dto });

      const result = await service.createGoogleUser(dto);
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.id).toBe('new-uuid');
    });

    it('debe lanzar BadRequestException si no se proporciona email', async () => {
      await expect(service.createGoogleUser({ googleId: '123', email: '' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateGoogleId', () => {
    it('debe actualizar el googleId del usuario y retornarlo', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.updateGoogleId('uuid-1234', 'google-1234');
      expect(mockRepository.update).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });
});
