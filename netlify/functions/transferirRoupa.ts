


// --- AVISO DE SEGURANÃ‡A ---
// A chave de API do Google (process.env.API_KEY) Ã© injetada de forma segura
// pelas VariÃ¡veis de Ambiente configuradas no painel da Netlify.
// NUNCA escreva a chave de API diretamente neste arquivo.

// Este cÃ³digo roda no backend (servidores da Netlify), nÃ£o no navegador.
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

// A Netlify fornece um tipo para o evento, mas vamos simplificar para clareza.
interface HandlerEvent {
  body: string;
}

// Esta Ã© a funÃ§Ã£o principal que a Netlify irÃ¡ executar.
export const handler = async (event: HandlerEvent) => {
  // 1. Buscando a Chave de API de forma SEGURA
  // A Netlify injeta as variÃ¡veis de ambiente que configuramos no site.
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Chave de API do Google nÃ£o estÃ¡ configurada no servidor." }),
    };
  }

  try {
    // 2. Lendo os dados que o frontend enviou
    const { 
      imagemRoupaBase64, tipoMimeRoupa, 
      imagemPessoaBase64, tipoMimePessoa, 
      aspectRatio 
    } = JSON.parse(event.body);

    if (!imagemRoupaBase64 || !imagemPessoaBase64 || !tipoMimeRoupa || !tipoMimePessoa || !aspectRatio) {
        return { statusCode: 400, body: JSON.stringify({ error: "Dados incompletos foram enviados. Faltam imagens ou proporÃ§Ã£o." }) };
    }

    // 3. Preparando a chamada para a API do Google (mesma lÃ³gica de antes)
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash-image';
    
    // Recriamos as "partes" da imagem a partir dos dados Base64 recebidos
    const parteImagemRoupa = { inlineData: { data: imagemRoupaBase64, mimeType: tipoMimeRoupa } };
    const parteImagemPessoa = { inlineData: { data: imagemPessoaBase64, mimeType: tipoMimePessoa } };

    // O prompt Ã© exatamente o mesmo que funcionou bem antes
    const promptPartes = [
      { text: `
        **COMANDO DE RENDERIZAÃ‡ÃƒO #1: PROPORÃ‡ÃƒO DE SAÃDA**
        - **ASPECT_RATIO_FINAL:** ${aspectRatio}
        - **MODO:** ESTRITO (NÃƒO-NEGOCIÃVEL)
        - **INSTRUÃ‡ÃƒO:** Ignorar as proporÃ§Ãµes das imagens de entrada. A imagem de saÃ­da DEVE ter EXATAMENTE a proporÃ§Ã£o ${aspectRatio}. Adapte o fundo para preencher este quadro. Esta Ã© a instruÃ§Ã£o de maior prioridade.
      `},
      { text: "\n\n**Imagem Alvo (Influencer):** A pessoa, pose e fundo desta imagem DEVEM ser a base do resultado final." },
      parteImagemPessoa,
      { text: "\n\n**Imagem Fonte (Modelo):** Extraia APENAS o conjunto de roupas completo (look completo) e seus acessÃ³rios desta imagem para aplicar na Imagem Alvo." },
      parteImagemRoupa,
      { text: `
        \n\n**INSTRUÃ‡ÃƒO FINAL:**
        Sua tarefa Ã© uma operaÃ§Ã£o de ediÃ§Ã£o de imagem tÃ©cnica e precisa. Gere uma nova imagem fotorrealista que mostre a pessoa da **Imagem Alvo** usando a roupa da **Imagem Fonte**, seguindo as regras abaixo.
        
        **REGRAS CRÃTICAS (OBRIGATÃ“RIO SEGUIR):**
        1.  **OBEDEÃ‡A O COMANDO DE RENDERIZAÃ‡ÃƒO:** A proporÃ§Ã£o de **${aspectRatio}** Ã© inegociÃ¡vel.
        2.  **PRESERVE A PESSOA ALVO:** O rosto, cabelo, tom de pele e pose da pessoa na Imagem Alvo nÃ£o devem ser alterados de forma alguma.
        3.  **PRESERVE O FUNDO ALVO:** O fundo da Imagem Alvo deve permanecer, adaptado para a proporÃ§Ã£o de saÃ­da.
        4.  **CLONAGEM DIGITAL DO LOOK COMPLETO (TRANSFERÃŠNCIA 1:1):** Substitua **TODO o conjunto de roupas** da Imagem Alvo pelo look da Imagem Fonte. **Ã‰ proibido mesclar peÃ§as.** A roupa transferida deve ser uma **clonagem digital** com **fidelidade absoluta** em cor, textura, e acessÃ³rios.
        5.  **NÃƒO RETORNE A IMAGEM FONTE:** O resultado deve ser uma modificaÃ§Ã£o da Imagem Alvo.
      `}
    ];

    const response: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: { parts: promptPartes },
      config: { responseModalities: [Modality.IMAGE] },
    });

    // 4. Processando a resposta do Google e enviando de volta para o frontend
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
        const base64ImageBytes: string = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        const dataUrl = `data:${mimeType};base64,${base64ImageBytes}`;
        
        return {
          statusCode: 200,
          body: JSON.stringify({ imageUrl: dataUrl }),
        };
      }
    }

    // Se o loop terminar sem retornar, significa que o Google nÃ£o gerou uma imagem.
    throw new Error("Nenhuma imagem foi gerada na resposta da API do Google.");

  } catch (error: any) {
    console.error("Erro na Netlify Function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Ocorreu um erro interno no servidor.' }),
    };
  }
};

