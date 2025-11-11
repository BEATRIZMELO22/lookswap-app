


// --- AVISO DE SEGURANÇA ---
// A chave de API do Google (process.env.API_KEY) é injetada de forma segura
// pelas Variáveis de Ambiente configuradas no painel da Netlify.
// NUNCA escreva a chave de API diretamente neste arquivo.

// Este código roda no backend (servidores da Netlify), não no navegador.
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

// A Netlify fornece um tipo para o evento, mas vamos simplificar para clareza.
interface HandlerEvent {
  body: string;
}

// Esta é a função principal que a Netlify irá executar.
export const handler = async (event: HandlerEvent) => {
  // 1. Buscando a Chave de API de forma SEGURA
  // A Netlify injeta as variáveis de ambiente que configuramos no site.
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Chave de API do Google não está configurada no servidor." }),
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
        return { statusCode: 400, body: JSON.stringify({ error: "Dados incompletos foram enviados. Faltam imagens ou proporção." }) };
    }

    // 3. Preparando a chamada para a API do Google (mesma lógica de antes)
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash-image';
    
    // Recriamos as "partes" da imagem a partir dos dados Base64 recebidos
    const parteImagemRoupa = { inlineData: { data: imagemRoupaBase64, mimeType: tipoMimeRoupa } };
    const parteImagemPessoa = { inlineData: { data: imagemPessoaBase64, mimeType: tipoMimePessoa } };

    // O prompt é exatamente o mesmo que funcionou bem antes
    const promptPartes = [
      { text: `
        **COMANDO DE RENDERIZAÇÃO #1: PROPORÇÃO DE SAÍDA**
        - **ASPECT_RATIO_FINAL:** ${aspectRatio}
        - **MODO:** ESTRITO (NÃO-NEGOCIÁVEL)
        - **INSTRUÇÃO:** Ignorar as proporções das imagens de entrada. A imagem de saída DEVE ter EXATAMENTE a proporção ${aspectRatio}. Adapte o fundo para preencher este quadro. Esta é a instrução de maior prioridade.
      `},
      { text: "\n\n**Imagem Alvo (Influencer):** A pessoa, pose e fundo desta imagem DEVEM ser a base do resultado final." },
      parteImagemPessoa,
      { text: "\n\n**Imagem Fonte (Modelo):** Extraia APENAS o conjunto de roupas completo (look completo) e seus acessórios desta imagem para aplicar na Imagem Alvo." },
      parteImagemRoupa,
      { text: `
        \n\n**INSTRUÇÃO FINAL:**
        Sua tarefa é uma operação de edição de imagem técnica e precisa. Gere uma nova imagem fotorrealista que mostre a pessoa da **Imagem Alvo** usando a roupa da **Imagem Fonte**, seguindo as regras abaixo.
        
        **REGRAS CRÍTICAS (OBRIGATÓRIO SEGUIR):**
        1.  **OBEDEÇA O COMANDO DE RENDERIZAÇÃO:** A proporção de **${aspectRatio}** é inegociável.
        2.  **PRESERVE A PESSOA ALVO:** O rosto, cabelo, tom de pele e pose da pessoa na Imagem Alvo não devem ser alterados de forma alguma.
        3.  **PRESERVE O FUNDO ALVO:** O fundo da Imagem Alvo deve permanecer, adaptado para a proporção de saída.
        4.  **CLONAGEM DIGITAL DO LOOK COMPLETO (TRANSFERÊNCIA 1:1):** Substitua **TODO o conjunto de roupas** da Imagem Alvo pelo look da Imagem Fonte. **É proibido mesclar peças.** A roupa transferida deve ser uma **clonagem digital** com **fidelidade absoluta** em cor, textura, e acessórios.
        5.  **NÃO RETORNE A IMAGEM FONTE:** O resultado deve ser uma modificação da Imagem Alvo.
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

    // Se o loop terminar sem retornar, significa que o Google não gerou uma imagem.
    throw new Error("Nenhuma imagem foi gerada na resposta da API do Google.");

  } catch (error: any) {
    console.error("Erro na Netlify Function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Ocorreu um erro interno no servidor.' }),
    };
  }
};