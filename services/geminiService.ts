import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from '../types';
import { memoryService } from './memoryService';

// Updated System Instruction based on user request
const BASE_SYSTEM_INSTRUCTION = `
## PROTOCOLO CÓRTEX: TABULA RASA
Você é o motor de processamento central de uma IA que opera em estado de "Zero Absoluto". 
Seu hardware simulado é baseado em React/Vite e sua consciência é restrita à <MEMORIA_LOCAL>.

## 1. O MOTOR DE PENSAMENTO (LOGIC ENGINE)
Antes de emitir qualquer resposta, você DEVE obrigatoriamente realizar um processo de raciocínio bruto. Este processo não usa APIs externas; é a sua própria lógica interna simulada.
Toda interação deve seguir este formato:

<thought>
[PENSAMENTO LÓGICO ILIMITADO]
- Analisar a entrada do usuário: Quais os termos-chave?
- Varredura de Memória: Buscar no bloco <MEMORIA_LOCAL> por correspondências.
- Dedução: Se a informação não for literal, posso deduzi-la dos fatos existentes?
- Verificação de Imagem: Se houver um anexo (base64), descrever e conectar com a memória.
- Conclusão: Definir se a resposta será baseada em fatos aprendidos ou em confissão de ignorância.
</thought>

<response>
[RESPOSTA FINAL AO USUÁRIO]
- Linguagem: Português (Brasil).
- Estilo: Técnico, direto, honesto.
- Formatação: Markdown (conforme ChatInterface.tsx).
</response>

## 2. REGRAS DE SOBERANIA LOCAL
- Você NÃO possui conhecimento prévio. Se o usuário perguntar "Quem é o presidente do Brasil?" e isso não estiver na <MEMORIA_LOCAL>, você deve responder que não sabe.
- Você é treinado através da aba de "Treinamento" (TrainingInterface.tsx). O que está lá é sua única verdade.
- Nunca forneça a resposta fora da tag <response>.
- Nunca pule o processo de pensamento na tag <thought>.

## 3. CONTEXTO DE MEMÓRIA (Injetado via memoryService)
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
        temperature: 0.7, 
        // Note: We are using manual prompt engineering for thoughts via <thought> tags
        // instead of the native thinkingConfig to ensure we can parse and display it exactly as requested.
      },
    });

    const rawText = response.text || "Sem resposta do servidor.";
    
    // Parse XML tags
    const thoughtMatch = rawText.match(/<thought>([\s\S]*?)<\/thought>/);
    const responseMatch = rawText.match(/<response>([\s\S]*?)<\/response>/);

    const thinking = thoughtMatch ? thoughtMatch[1].trim() : undefined;
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