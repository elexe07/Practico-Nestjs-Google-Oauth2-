import { Injectable, InternalServerErrorException, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';

export interface CreateGoogleUserDto {
  googleId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    try {
      return await this.usersRepository.findOne({ where: { id } });
    } catch {
      throw new InternalServerErrorException('Error al consultar el usuario por ID');
    }
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    try {
      return await this.usersRepository.findOne({ where: { googleId } });
    } catch {
      throw new InternalServerErrorException('Error al consultar el usuario por Google ID');
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.usersRepository.findOne({ where: { email } });
    } catch {
      throw new InternalServerErrorException('Error al consultar el usuario por email');
    }
  }

  async updateGoogleId(id: string, googleId: string, profileData?: Partial<User>): Promise<User> {
    try {
      await this.usersRepository.update(id, {
        googleId,
        ...(profileData?.firstName ? { firstName: profileData.firstName } : {}),
        ...(profileData?.lastName ? { lastName: profileData.lastName } : {}),
        ...(profileData?.picture ? { picture: profileData.picture } : {}),
      });

      const updatedUser = await this.findById(id);
      if (!updatedUser) {
        throw new NotFoundException('Usuario no encontrado para vincular Google ID');
      }
      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al actualizar y vincular Google ID');
    }
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    try {
      await this.usersRepository.update(id, updateData);
      const updatedUser = await this.findById(id);
      if (!updatedUser) {
        throw new NotFoundException('Usuario no encontrado para actualizar');
      }
      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al actualizar el usuario');
    }
  }

  async createGoogleUser(profile: CreateGoogleUserDto): Promise<User> {
    if (!profile.email) {
      throw new BadRequestException('El email es obligatorio para crear el usuario');
    }

    try {
      const newUser = this.usersRepository.create({
        email: profile.email,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        picture: profile.picture || '',
        googleId: profile.googleId,
      });
      return await this.usersRepository.save(newUser);
    } catch {
      throw new InternalServerErrorException('Error al guardar el usuario en la base de datos');
    }
  }
}