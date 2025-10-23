import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class YesNoReplyDto {
  
  // ------------------------------------------------
  // 1. reply (La respuesta del usuario)
  // ------------------------------------------------
  @IsString() // Asegura que el valor sea de tipo string.
  @IsNotEmpty() // Asegura que el valor no sea una cadena vacía.
  
  // 💡 Novedad: Garantiza que la respuesta sea uno de los valores válidos.
  @IsIn(['si', 'no', 'no sé', 'no se', 'SI', 'NO', 'NO SÉ', 'NO SE', 'Si', 'No', 'No Sé', 'No se']) 
  reply: string;

  // ------------------------------------------------
  // 2. gameId (Identificador de la Partida)
  // ------------------------------------------------
  // Necesitas un ID para que el Servicio pueda encontrar el historial de chat.
  @IsString()
  @IsNotEmpty()
  gameId: string;
  
  // ------------------------------------------------
  // 3. topic (Tema a Adivinar)
  // ------------------------------------------------
  // El tema es necesario para las SYSTEM_INSTRUCTIONS de Gemini.
  @IsString()
  @IsNotEmpty()
  topic: string;
}