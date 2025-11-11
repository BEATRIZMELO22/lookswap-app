


// Função auxiliar para converter um objeto File para uma string Base64
const arquivoParaBase64 = (arquivo: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    // A string resultante do `readAsDataURL` é "data:image/png;base64,iVBORw0KGgo...". 
    // Nós só queremos a parte depois da vírgula.
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });
};

export const transferirRoupa = async (
  arquivoRoupa: File,
  arquivoPessoa: File,
  aspectRatio: '9:16' | '16:9'
): Promise<string> => {

  // Converte os arquivos para o formato Base64 para que possam ser enviados no corpo de uma requisição JSON
  const imagemRoupaBase64 = await arquivoParaBase64(arquivoRoupa);
  const imagemPessoaBase64 = await arquivoParaBase64(arquivoPessoa);

  // Este é o "endereço" do nosso assistente seguro (Netlify Function).
  // A Netlify automaticamente disponibiliza as funções neste caminho.
  const endpoint = '/.netlify/functions/transferirRoupa';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Enviamos todos os dados necessários para o nosso backend em formato JSON
      body: JSON.stringify({
        imagemRoupaBase64,
        tipoMimeRoupa: arquivoRoupa.type,
        imagemPessoaBase64,
        tipoMimePessoa: arquivoPessoa.type,
        aspectRatio,
      }),
    });

    const data = await response.json();

    // Se a resposta não for "OK" (ex: erro 400 ou 500), nós lemos a mensagem de erro
    // que nosso backend enviou e a lançamos para que o App.tsx possa exibi-la.
    if (!response.ok) {
      throw new Error(data.error || 'Ocorreu uma falha no servidor. Tente novamente.');
    }

    // Se tudo deu certo, `data.imageUrl` conterá a imagem gerada.
    return data.imageUrl;
  } catch (error: any) {
    console.error("Erro ao chamar a Netlify Function:", error);
    // Re-lança o erro para que o componente App possa pegá-lo e mostrar ao usuário.
    throw new Error(error.message || 'Não foi possível se comunicar com o servidor.');
  }
};
