import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // <-- 1. Importa el ConfigModule
import { YesNoGameModule } from './yes-no-game/yes-no-game.module';

@Module({
  imports: [
    // 2. Registra el ConfigModule para que cargue el .env
    ConfigModule.forRoot({
      // Esto hace que ConfigModule sea global, para que no
      // tengas que importarlo en cada módulo que use variables de entorno
      isGlobal: true, 
    }),
    YesNoGameModule,
  ],
})
export class AppModule {}