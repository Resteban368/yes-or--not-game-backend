import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from "@google/genai";



@Injectable()
export class YesNoGameService {

    // La clave se lee del process.env porque ya cargaste el ConfigModule
    private readonly ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
    });


    async sendReplay() {
        const response = await this.ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Que tal el clima hoy en madrid?",
        });


        return {
            reply: response.text,
        };
    }

}

