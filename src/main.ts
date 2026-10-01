import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // habilitar cors por si pegamos desde un front en angular/react
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server corriendo en http://localhost:${port}`);
}
void bootstrap();