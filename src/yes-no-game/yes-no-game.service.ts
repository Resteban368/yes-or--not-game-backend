// src/yes-no-game/yes-no-game.service.ts

import { Injectable, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { GoogleGenAI } from "@google/genai";
import { YesNoReplyDto } from './dtos/yes-no-reply.dto';

// ------------------------------------------------
// 1. INTERFAZ: Define la estructura del historial de chat
// ------------------------------------------------
export interface BasicMessage {
    // 'user' para los mensajes del cliente, 'model' para las respuestas de Gemini
    role: 'user' | 'model';
    // El contenido del mensaje (la pregunta o la respuesta 'si'/'no')
    reply: string;
}

@Injectable()
export class YesNoGameService {

    // ------------------------------------------------
    // 2. PROPIEDADES DE LA CLASE
    // ------------------------------------------------

    // Conexión al cliente de Gemini. 'private readonly' es una buena práctica (POO).
    // La clave se lee de process.env gracias al @nestjs/config (ConfigModule) configurado en AppModule.
    private readonly ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });

    // Almacenamiento temporal para el historial de chat.
    // Clave: gameId (identificador de la partida), Valor: arreglo de mensajes (BasicMessage[]).
    // NOTA: Esto se borra al reiniciar el servidor. En producción, usaríamos Redis o una DB.
    private chatHistory = new Map<String, BasicMessage[]>();

    // ------------------------------------------------
    // 3. LÓGICA PRINCIPAL DEL JUEGO (Método Asíncrono)
    // ------------------------------------------------
    async sendReplay(gameId: String, topic: string, YesNoReplyDto: YesNoReplyDto) {

        // Desestructuración: Extrae la respuesta del usuario (si, no, no sé) del DTO.
        const { reply } = YesNoReplyDto;

        // Recupera el historial existente para este gameId, o inicia uno vacío.
        const history = this.chatHistory.get(gameId) || [];

        const currentQuestionNumber = history.filter(msg => msg.role === 'model').length;

        // ------------------------------------------------
        // 4. INSTRUCCIONES DEL SISTEMA (System Prompt)
        // ------------------------------------------------
        // Define el comportamiento, las reglas y las restricciones del modelo Gemini.
        const SYSTEM_INSTRUCTIONS = `
# Role:
  - Eres un ente que adivina el personaje de '${topic}' que el usuario está pensando.
  - ESTÁS EN LA PREGUNTA NÚMERO ${currentQuestionNumber + 1}.

# Reglas:
  - El usuario sólo puede responder con "si" o "no" o "no sé".
  - Tienes que adivinar el personaje de ${topic} que el usuario está pensando.
  - Puedes hacer preguntas cuyas respuestas sean únicamente "si" o "no" o "no sé".          
  - Tienes que adivinar en menos de 10 preguntas.
  - Responde en español.
  - Solamente texto, nada de markdown.
  - Hasta no estar totalmente seguro, no debes de adivinar.
  - Haz las preguntas de forma directa y corta.
`;

        // ------------------------------------------------
        // 5. CREACIÓN DE LA SESIÓN DE CHAT (Contexto)
        // ------------------------------------------------
        // Crea la sesión de chat con Gemini, incluyendo el contexto anterior.
        const chat = this.ai.chats.create({
            model: 'gemini-2.5-flash', // Modelo rápido y económico para conversaciones en tiempo real.
            // Mapea el formato de historial interno al formato que requiere la API de Gemini.
            history: history.map((message) => ({
                role: message.role,
                parts: [{ text: message.reply }],
            })),
            config: {
                systemInstruction: SYSTEM_INSTRUCTIONS, // Aplica las reglas definidas arriba.
                // Configuraciones de optimización de pensamiento (Opcional)
                thinkingConfig: {
                    includeThoughts: false,
                    thinkingBudget: -1,
                },
            },
        });

        try {
            // ------------------------------------------------
            // 6. LÓGICA DE PARTIDA NUEVA (Primer Mensaje)
            // ------------------------------------------------
            if (history.length === 0) {
                // Envía un mensaje inicial para forzar a la IA a hacer la primera pregunta.
                const response = await chat.sendMessage({
                    message: 'Inicia el juego.',
                });

                // Guarda el prompt del sistema y la primera pregunta de Gemini en el historial.
                history.push({ role: 'user', reply: 'Inicia el juego.' });
                history.push({ role: 'model', reply: response.text || '' });

                // Actualiza el estado de la partida en el mapa (almacenamiento temporal).
                this.chatHistory.set(gameId, history);

                // Retorna la primera pregunta al Controller.
                return {
                    reply: response.text || '',
                    questionNumber: 0, // Primera pregunta
                    history: history,
                };
            }

            // ------------------------------------------------
            // 7. LÓGICA DE RESPUESTA DEL USUARIO (Flujo Normal)
            // ------------------------------------------------
            // Si no es el primer mensaje, el usuario está respondiendo a la última pregunta.
            const response = await chat.sendMessage({
                message: reply, // Envía la respuesta del usuario (Si, no o no sé).
            });

            // 8. Actualizar el historial con la respuesta del usuario y la nueva pregunta de la IA.
            history.push({
                role: 'user',
                reply: reply,
            });

            history.push({
                role: 'model',
                reply: response.text || '',
            });

            // 9. Guarda el estado actualizado.
            this.chatHistory.set(gameId, history);

            // 10. Retorna la nueva pregunta/adivinanza de Gemini.
            return {
                reply: response.text || '',
                history: history,
                questionNumber: currentQuestionNumber + 1, // La pregunta actual + 1 (la recién generada)
            };

        } catch (error) {
            // ------------------------------------------------
            // MEJORA EN EL MANEJO DE ERRORES
            // ------------------------------------------------

            // 1. Identificar el error de Gemini (ApiError)
            if (error.status === 503) {
                // Relanzar como una excepción HTTP 503 de NestJS
                throw new ServiceUnavailableException(
                    'El modelo de IA está sobrecargado. Por favor, inténtalo de nuevo en un minuto.'
                );
            }

            // 2. Manejar otros errores desconocidos de la API (ej. clave incorrecta, 400, 403)
            if (error.status && error.message) {
                throw new InternalServerErrorException(
                    `Error en la API de Gemini (${error.status}): ${error.message}`
                );
            }

            // 3. Si no es un error de API, lanzar un error interno genérico
            throw new InternalServerErrorException(
                'Ha ocurrido un error inesperado al procesar la solicitud.'
            );
        }

    }

}