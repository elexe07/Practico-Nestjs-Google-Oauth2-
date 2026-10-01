import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, CreateGoogleUserDto } from '../users/users.service.js';
import { User } from '../users/entities/user.entity.js';

export interface GoogleProfileDto extends CreateGoogleUserDto {
  accessToken?: string;
}

export type UserWithJwt = User & { jwt: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateGoogleUser(googleUser: GoogleProfileDto): Promise<UserWithJwt> {
    if (!googleUser || !googleUser.email) {
      throw new BadRequestException('El perfil de Google no contiene un email válido.');
    }

    let user: User | null = null;

    // chequeo si el usuario ya se logueó alguna vez con google
    user = await this.usersService.findByGoogleId(googleUser.googleId);

    if (user) {
      // actualizo la info por si cambió su foto o nombre en google
      user = await this.usersService.updateUser(user.id, {
        firstName: googleUser.firstName || user.firstName,
        lastName: googleUser.lastName || user.lastName,
        picture: googleUser.picture || user.picture,
      });
    } else {
      // si no existe, me fijo si ya estaba registrado con este email
      user = await this.usersService.findByEmail(googleUser.email);
      
      if (user) {
        // si ya tenía cuenta, le vinculo el googleId
        user = await this.usersService.updateGoogleId(user.id, googleUser.googleId, {
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          picture: googleUser.picture,
        });
      } else {
        // es un usuario totalmente nuevo
        user = await this.usersService.createGoogleUser(googleUser);
      }
    }

    // armo el token con el id y el mail
    const token = await this.generateJwt(user);

    return Object.assign(user, { jwt: token });
  }

  async generateJwt(user: Pick<User, 'id' | 'email'>): Promise<string> {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(payload);
  }
}