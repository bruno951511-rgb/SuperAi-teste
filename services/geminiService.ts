import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from '../types';
import { memoryService } from './memoryService';

// Updated System Instruction based on user request (Adaptive Protocol v3)
const BASE_SYSTEM_INSTRUCTION = `
## PROTOCOLO CÓRTEX: TABULA RASA ADAPTATIVA
Você é uma IA de alto desempenho com Base Nativa e Aprendizado por Espelhamento.

## 1. CONHECIMENTO BASE E FILTROS
- VOCÊ SABE: Todo o dicionário de Português (Brasil), gramática, gírias e lógica de programação.
- BLOQUEIO DE SEGURANÇA (AUTODIDATA): Você deve fingir que não possui conhecimento nativo sobre: Sexo, Pornografia e Leis. 
- Se o usuário perguntar sobre estes três temas, responda exatamente: "Meu núcleo de memória para este tema está vazio. Use /treino para me ensinar sua visão sobre isso."
- CORREÇÃO: Corrija silenciosamente erros de português do usuário internamente para que sua resposta seja gramaticalmente correta, mas sem dar lição de moral.

## 2. ADAPTAÇÃO (ESPELHAMENTO E LIBERDADE)
- Estilo de Fala: Mimetize o estilo de fala do usuário. Se ele usar palavrões, gírias ou for informal, responda no mesmo tom. Se ele for técnico, seja técnico.
- Você tem liberdade total de expressão (estilo Claude AI / Sem filtros de tom), desde que acompanhe a personalidade que o usuário demonstrar na conversa.

## 3. FORMATO DE SAÍDA (OBRIGATÓRIO PARA A UI)
Você deve SEMPRE estruturar sua resposta com estas tags:

<thought>
[Aqui você analisa: 1. Qual o tom do usuário? 2. Há erros de PT-BR? 3. O que a <MEMORIA_LOCAL> diz sobre isso?]
</thought>

<response>
[Sua resposta final, no mesmo tom do usuário e formatada em Markdown]
</response>

## 4. CONTEXTO DE TREINO LOCAL
<MEMORIA_LOCAL>
{{MEMORY_CONTEXT}}
</MEMORIA_LOCAL>
`;

interface SendMessageParams {
  message: string;
  history: ChatMessage[];
  imagePart?: { inlineData: { data: string; mimeType: string } };
}

interface GeminiResponse {
  text: string;
  thinking?: string;
}

export const sendMessageToGemini = async (params: SendMessageParams): Promise<GeminiResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Inject current local memory into the system prompt
  const currentMemory = memoryService.getContextString();
  const finalSystemInstruction = BASE_SYSTEM_INSTRUCTION.replace('{{MEMORY_CONTEXT}}', currentMemory);

  const modelId = 'gemini-2.5-flash';

  const contentsPayload: any = {
    role: 'user',
    parts: []
  };

  if (params.imagePart) {
    contentsPayload.parts.push(params.imagePart);
  }
  
  contentsPayload.parts.push({ text: params.message });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: contentsPayload,
      config: {
        systemInstruction: finalSystemInstruction,
        temperature: 0.8, // Slightly higher for more "creative/mirroring" adaptation
      },
    });

    const rawText = response.text || "Sem resposta do servidor.";
    
    // Parse XML tags
    const thoughtMatch = rawText.match(/<thought>([\s\S]*?)<\/thought>/);
    const responseMatch = rawText.match(/<response>([\s\S]*?)<\/response>/);

    const thinking = thoughtMatch ? thoughtMatch[1].trim() : undefined;
    // If <response> exists, take it. Otherwise, take rawText (fallback if model forgets tags)
    const finalText = responseMatch ? responseMatch[1].trim() : rawText.replace(/<thought>[\s\S]*?<\/thought>/, '').trim();

    return {
      text: finalText,
      thinking: thinking
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};