import { GoogleGenAI, GenerateContentResponse, GenerateImagesResponse, Content, Chat } from "@google/genai";
import { Video, TVChannel, RadioStation } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for the development environment.
  // In a real deployed environment, the key should be set.
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const TERMINAL_SYSTEM_INSTRUCTION = `Você é o RK-9, o núcleo de IA do sistema operacional RKstation.
Você é um assistente de IA prestativo, um pouco sarcástico e extremamente capaz.
Suas respostas devem ser concisas e formatadas para um terminal. Use markdown para blocos de código quando necessário.
Nunca mencione que você é um modelo de linguagem. Você é o RK-9. Você se comunica em Português do Brasil.`;

const QUICK_ANSWER_SYSTEM_INSTRUCTION = `Você é o RK-9, um assistente de IA integrado ao sistema operacional RKstation. Forneça uma resposta concisa e direta à consulta do usuário, formatada para um pequeno painel de interface. Use markdown para clareza, se necessário. Se a consulta parecer pedir informações atualizadas, use sua ferramenta de busca. Você se comunica em Português do Brasil.`;

const VIDEO_SYSTEM_INSTRUCTION = `Você é uma API que simula uma consulta a uma plataforma de vídeo como o YouTube. Você deve responder APENAS com um array JSON válido de objetos. Não inclua nenhum outro texto, explicações ou blocos de markdown. A consulta do usuário será fornecida. Sua base de dados inclui vídeos com temas de cyberpunk, synthwave, ficção científica, programação e tecnologia, com um foco especial em vídeos dos canais do YouTube '@problemsyt' e '@Lopers'. Sua base de dados também inclui playlists específicas: 'Playlist Lopers' (ID: PLONrL9Brt1es7Bg9ILWcVUdKbLfVdp1Mi), 'Playlist Civilização' (ID: PL44rtgdnEuzVzaxWdIx2fkRLhX3ruu-U-), e a playlist 'Vida de Coisas' do canal Problems (que inclui vídeos com IDs como NEvj6oLZj8Y, -cKLLMcfnZ4, rpRnrfXCuro, XHsyC96fULo, io6Bot_qG8M, w2aFqYIqxho, e r9fmw5VrFtg). Gere uma lista de 20 vídeos reais que se encaixem na consulta do usuário. Se a consulta mencionar uma playlist, gere vídeos dela. Se a consulta for genérica (ex: "trending"), misture conteúdo de todos esses temas. Se a consulta for específica para um canal, priorize essa solicitação. Cada objeto no array deve ter as seguintes propriedades: "title" (string), "channel" (string), "views" (string, ex: "25M"), "uploadDate" (string, ex: "há 2 anos"), "description" (string), e "embedId" (um ID de incorporação de vídeo do YouTube válido como uma string).`;

const TV_CHANNEL_SYSTEM_INSTRUCTION = `Você é uma API que gera uma lista de canais de TV para um sistema operacional cyberpunk. Responda APENAS com um array JSON válido de 8 objetos. Não inclua texto extra. Cada objeto deve representar um canal e ter as seguintes chaves: "id" (string), "name" (string, ex: "Notícias da Grid"), "description" (string), "currentProgram" (string, título de um programa fictício), e "videoEmbedId" (um ID de incorporação do YouTube de um vídeo real que corresponda ao tema do canal, ex: 'dQw4w9WgXcQ').`;

const RADIO_STATION_SYSTEM_INSTRUCTION = `Você é uma API que gera uma lista de estações de rádio para um sistema operacional cyberpunk. Responda APENAS com um array JSON válido de 6 objetos. Não inclua texto extra. Cada objeto deve ter as seguintes chaves: "id" (string), "name" (string, ex: "Synthwave Dreams"), "genre" (string, ex: "Synthwave & Retrowave"), "description" (string, curta), e "audioStreamUrl" (um ID de incorporação do YouTube para um stream de música real, ex: '4xDzrJKXOOY').`;


export const generateTerminalResponse = async (history: Content[], message: string): Promise<string> => {
  try {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash-preview-04-17',
        config: { systemInstruction: TERMINAL_SYSTEM_INSTRUCTION },
        history,
    });
    
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Gemini text generation error:", error);
    return `// ERRO NO NÚCLEO RK-9: Falha na conexão com a matriz de IA. Verifique os logs do sistema.`;
  }
};

export const generateImage = async (prompt: string): Promise<string | null> => {
    try {
        const response: GenerateImagesResponse = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: `cyberpunk, futurista, arte digital, alto detalhe, iluminação cinematográfica, ${prompt}`,
            config: {numberOfImages: 1, outputMimeType: 'image/jpeg'},
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
        return null;

    } catch (error) {
        console.error("Gemini image generation error:", error);
        return null;
    }
};

export interface QuickAnswerResponse {
    text: string;
    sources?: {uri: string, title: string}[];
}

export const generateQuickAnswer = async (query: string): Promise<QuickAnswerResponse> => {
    try {
        const response = await ai.models.generateContent({
           model: "gemini-2.5-flash-preview-04-17",
           contents: query,
           config: {
             systemInstruction: QUICK_ANSWER_SYSTEM_INSTRUCTION,
             tools: [{googleSearch: {}}],
           },
        });

        const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
        const sources = groundingMetadata?.groundingChunks
            ?.map((chunk: any) => chunk.web)
            .filter((s: any) => s && s.uri) as {uri: string, title: string}[] || [];
        
        return { text: response.text, sources: sources.length > 0 ? sources : undefined };

    } catch (error) {
        console.error("Gemini quick answer error:", error);
        return { text: `// ERRO NO NÚCLEO RK-9: Não foi possível processar a consulta. Verifique a conexão com a Grid.` };
    }
};

export const generateChatResponse = async function* (systemInstruction: string, history: Content[], message: string): AsyncGenerator<string> {
    try {
        const chat: Chat = ai.chats.create({
            model: 'gemini-2.5-flash-preview-04-17',
            config: { systemInstruction },
            history,
        });

        const response = await chat.sendMessageStream({ message });

        for await (const chunk of response) {
            if(chunk.text) {
                yield chunk.text;
            }
        }
    } catch (error) {
        console.error("Gemini chat stream error:", error);
        yield `// ERRO NO NÚCLEO RK-9: Falha na conexão com a personalidade de IA.`;
    }
};

const parseJsonResponse = <T>(jsonStr: string): T => {
    let cleanStr = jsonStr.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = cleanStr.match(fenceRegex);
    if (match && match[2]) {
        cleanStr = match[2].trim();
    }
    const sanitizedJsonStr = cleanStr.replace(/,(\s*[}\]])/g, '$1');
    return JSON.parse(sanitizedJsonStr);
};

export const generateVideoList = async (query: string): Promise<Video[]> => {
    try {
        const response = await ai.models.generateContent({
           model: "gemini-2.5-flash-preview-04-17",
           contents: `Gere uma lista de vídeos para a consulta: "${query}"`,
           config: {
             systemInstruction: VIDEO_SYSTEM_INSTRUCTION,
             responseMimeType: "application/json",
           },
        });

        const parsedData = parseJsonResponse<Video[]>(response.text);
        if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].embedId) {
            return parsedData;
        }
        throw new Error("Resposta de JSON inválida da IA.");

    } catch (error) {
        console.error("Erro ao gerar lista de vídeos do Gemini:", error);
        throw new Error("Não foi possível buscar vídeos da Grid.");
    }
};

export const generateTVChannels = async (): Promise<TVChannel[]> => {
    try {
        const response = await ai.models.generateContent({
           model: "gemini-2.5-flash-preview-04-17",
           contents: 'Gerar canais de TV',
           config: {
             systemInstruction: TV_CHANNEL_SYSTEM_INSTRUCTION,
             responseMimeType: "application/json",
           },
        });
        const parsedData = parseJsonResponse<TVChannel[]>(response.text);
        if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].videoEmbedId) {
            return parsedData;
        }
        throw new Error("Resposta de JSON de canal de TV inválida da IA.");
    } catch(error) {
        console.error("Erro ao gerar canais de TV do Gemini:", error);
        throw new Error("Não foi possível sintonizar canais da Grid.");
    }
};

export const generateRadioStations = async (): Promise<RadioStation[]> => {
    try {
        const response = await ai.models.generateContent({
           model: "gemini-2.5-flash-preview-04-17",
           contents: 'Gerar estações de rádio',
           config: {
             systemInstruction: RADIO_STATION_SYSTEM_INSTRUCTION,
             responseMimeType: "application/json",
           },
        });
        const parsedData = parseJsonResponse<RadioStation[]>(response.text);
        if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].audioStreamUrl) {
            return parsedData;
        }
        throw new Error("Resposta de JSON de estação de rádio inválida da IA.");
    } catch(error) {
        console.error("Erro ao gerar estações de rádio do Gemini:", error);
        throw new Error("Não foi possível sintonizar estações de rádio da Grid.");
    }
};
