import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      message: 'API de autenticación con Google OAuth2',
      endpoints: {
        root: '/',
        googleAuth: '/auth/google',
        googleRedirect: '/auth/google/redirect',
        profile: '/auth/profile',
      },
      version: '1.0.0',
    };
  }
}
