import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { ConfigService } from '@nestjs/config';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: Partial<Record<keyof AuthService, any>>;
  let configService: Partial<Record<keyof ConfigService, any>>;

  beforeEach(async () => {
    authService = {
      generateJwt: vi.fn().mockResolvedValue('test-jwt-token'),
    };

    configService = {
      get: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('googleAuthRedirect', () => {
    it('debe responder con JSON si no hay FRONTEND_URL', async () => {
      configService.get.mockReturnValue(null);
      const req = {
        user: { id: 'uuid-1', email: 'test@example.com', jwt: 'mocked-jwt' },
      } as any;

      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;

      await controller.googleAuthRedirect(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Autenticación exitosa con Google OAuth2',
        token: 'mocked-jwt',
        user: req.user,
      });
    });

    it('debe redirigir al frontend si FRONTEND_URL está configurado', async () => {
      configService.get.mockReturnValue('http://localhost:4200/login-success');
      const req = {
        user: { id: 'uuid-1', email: 'test@example.com', jwt: 'mocked-jwt' },
      } as any;

      const res = {
        redirect: vi.fn(),
      } as any;

      await controller.googleAuthRedirect(req, res);

      expect(res.redirect).toHaveBeenCalledWith(
        'http://localhost:4200/login-success?token=mocked-jwt',
      );
    });
  });

  describe('getProfile', () => {
    it('debe retornar el usuario autenticado del request', () => {
      const req = {
        user: { id: 'uuid-1', email: 'test@example.com' },
      } as any;

      const result = controller.getProfile(req);
      expect(result).toEqual({
        message: 'Acceso autorizado a ruta privada',
        user: req.user,
      });
    });
  });
});
