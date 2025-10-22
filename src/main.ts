import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //prefijo global para todas las rutas del controlador YesNoGame
  app.setGlobalPrefix('api/');

  // 2. Aplicar el ValidationPipe globalmente
  app.useGlobalPipes(new ValidationPipe({
    // Permite que el validador elimine cualquier propiedad
    // del objeto que no esté definida en el DTO. Esto aumenta la seguridad.
    whitelist: true,
    transform: true, // Transforma las cargas útiles a las instancias de las clases DTO
    forbidNonWhitelisted: true, // Lanza un error si hay propiedades no definidas en el DTO

  }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
