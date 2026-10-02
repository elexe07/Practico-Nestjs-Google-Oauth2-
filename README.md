# Trabajo Práctico: Autenticación con NestJS y Google OAuth2

Backend para resolver el TP de integración de Google OAuth2 utilizando NestJS, TypeORM y JWT.

## Requisitos previos

- Node.js
- PostgreSQL (opcional, el proyecto soporta SQLite para probarlo rápido)
- Credenciales de Google Cloud Console (Client ID y Secret)

## Pasos para levantar el proyecto

1. Instalar las dependencias:
```bash
npm install
```

2. Crear el archivo `.env` copiando el de ejemplo:
```bash
cp .env.example .env
```
Luego completa el `.env` con tus claves de Google.

3. Base de datos:
Por defecto el `.env` viene con `DB_TYPE=sqlite`. Esto crea un archivo local para que puedas probar el login sin tener que configurar Postgres. 
Si queres usar Postgres, cambialo a `DB_TYPE=postgres` y asegurate de tener el motor corriendo en el puerto 5432.

4. Correr la aplicación:
```bash
npm run start:dev
```

## Rutas disponibles

- `GET http://localhost:3000/` : Muestra un resumen de la API.
- `GET http://localhost:3000/auth/google` : Inicia el flujo de OAuth con Google (entra acá desde el navegador).
- `GET http://localhost:3000/auth/google/redirect` : El callback que usa Google internamente.
- `GET http://localhost:3000/auth/profile` : Ruta protegida. Necesitas pasarle el token JWT en el header `Authorization: Bearer <token>`.
- `POST http://localhost:3000/auth/register` : Registro con email y contraseña, devuelve JWT y datos de usuario.
- `POST http://localhost:3000/auth/login` : Login con email y contraseña, devuelve JWT y datos de usuario.

### Ejemplo de prueba para los endpoint POST de registro y login en la terminal (Invoke-WebRequest)
(Copiar y pegar en la terminal)
# Registro
```
Invoke-WebRequest -Uri http://localhost:3000/auth/register `
                  -Method POST `
                  -Headers @{ "Content-Type" = "application/json" } `
                  -Body '{ "email":"juan@example.com","password":"Secret123","firstName":"Juan","lastName":"Pérez" }'
```
# Login
```
Invoke-WebRequest -Uri http://localhost:3000/auth/login `
                  -Method POST `
                  -Headers @{ "Content-Type" = "application/json" } `
                  -Body '{ "email":"juan@example.com","password":"Secret123" }'
```

## Notas sobre la implementación

- El módulo `DatabaseModule` lee el `.env` y decide si usa Postgres o Sqlite.
- Se previene la duplicación de usuarios: si entras con Google y ya existía una cuenta con ese mismo correo, simplemente se vincula el `googleId` a esa cuenta.
- Toda la validación está protegida con guards (`AuthGuard` y `JwtAuthGuard`).
