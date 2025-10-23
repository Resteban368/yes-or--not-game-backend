// src/yes-no-game/yes-no-game.controller.ts

import { Body, Controller, Post, Delete, Param } from '@nestjs/common'; // Ya no necesitamos 'Param' ni 'Get' (por ahora)
import { YesNoGameService } from './yes-no-game.service';
import { YesNoReplyDto } from './dtos/yes-no-reply.dto'; // Importamos el DTO

@Controller('yes-no-game')
export class YesNoGameController {
  constructor(private readonly yesNoGameService: YesNoGameService) { }


  @Post('/reply') // Usaremos /reply para enviar la respuesta (más claro)
  async submitReply(@Body() replyData: YesNoReplyDto) {

    // 1. El ValidationPipe y el DTO ya validaron: gameId, topic, y reply (si/no/no sé).

    // 2. Llama al servicio, delegando el manejo de la IA y el historial.
    // Usamos el destructuring para pasar los campos requeridos al servicio.
    return await this.yesNoGameService.sendReplay(
      replyData.gameId,
      replyData.topic,
      replyData
    );
  }


  /**
   * Elimina el historial de chat para una partida (gameId) específica.
   * Ruta: DELETE /api/yes-no-game/{gameId}
   * @param gameId Captura el valor del gameId de la URL.
   * @returns Mensaje de confirmación.
   */
  @Delete(':gameId') // ⬅️ Usamos el verbo DELETE y definimos el parámetro de ruta :gameId
  resetGame(@Param('gameId') gameId: string) {
    // Delegamos la lógica de eliminación al servicio
    return this.yesNoGameService.resetGame(gameId);
  }
}


