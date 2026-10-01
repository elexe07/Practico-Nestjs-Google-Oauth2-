import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() _req: Request): Promise<void> {
    // passport te redirige solo a la pantalla de login de google
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response): Promise<void> {
    const user = req.user as any;
    const token = user?.jwt || (await this.authService.generateJwt(user));

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    if (frontendUrl) {
      // si definieron una url de frontend, redirigimos mandando el token por query
      res.redirect(`${frontendUrl}?token=${token}`);
      return;
    }

    // si no hay frontend, devolvemos un json básico
    res.status(200).json({
      message: 'Login exitoso',
      token,
      user,
    });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req: Request) {
    return {
      message: 'Acceso autorizado a ruta privada',
      user: req.user,
    };
  }
}