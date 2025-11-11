


import React, { useState, useCallback, DragEvent } from 'react';
import { transferirRoupa } from './services/geminiService';

// --- Ãcones SVG --- //
const IconeUpload: React.FC = () => (
  <svg className="w-10 h-10 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
  </svg>
);

const IconeVARINHA: React.FC = () => (
  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.5,2.5a1,1,0,0,0-1,1v2.4a1,1,0,0,0,2,0V3.5A1,1,0,0,0,12.5,2.5Z M6.1,4.7a1,1,0,0,0-1.4,0l-1,1a1,1,0,0,0,0,1.4l1,1a1,1,0,0,0,1.4,0l1-1A1,1,0,0,0,6.1,4.7Z M18.9,4.7a1,1,0,0,0,0-1.4l-1-1a1,1,0,0,0-1.4,0l-1,1a1,1,0,0,0,0,1.4l1,1A1,1,0,0,0,18.9,4.7Z M21,11.5a1,1,0,0,0-1-1H17.6a1,1,0,0,0,0,2H20A1,1,0,0,0,21,11.5Z M6.4,10.5H4a1,1,0,0,0,0,2H6.4a1,1,0,0,0,0-2Z M12.5,14.5a2,2,0,0,0,2,2,1,1,0,0,1,1,1,2,2,0,0,0,4,0,1,1,0,0,1,1-1,2,2,0,0,0,0-4,1,1,0,0,1-1-1,2,2,0,0,0-4,0,1,1,0,0,1-1,1A2,2,0,0,0,12.5,14.5Z M3,18.5a2,2,0,0,0,2,2,1,1,0,0,1,1,1,2,2,0,0,0,4,0,1,1,0,0,1,1-1,2,2,0,0,0,0-4,1,1,0,0,1-1-1,2,2,0,0,0-4,0,1,1,0,0,1-1,1A2,2,0,0,0,3,18.5Z"/>
  </svg>
);

const IconeLimpar: React.FC = () => (
  <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconeDownload: React.FC = () => (
    <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);


// --- Componentes Filhos --- //
interface UploaderImagemProps {
  onImagemSelecionada: (arquivo: File) => void;
  previewImagem: string | null;
}

const UploaderImagem: React.FC<UploaderImagemProps> = ({ onImagemSelecionada, previewImagem }) => {
  const [arrastando, setArrastando] = useState(false);

  const handleMudancaArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImagemSelecionada(e.target.files[0]);
    }
  };

  const handleEventosArrastar = (e: DragEvent<HTMLLabelElement>, estaArrastando: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setArrastando(estaArrastando);
  };

  const handleSoltar = (e: DragEvent<HTMLLabelElement>) => {
    handleEventosArrastar(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (e.dataTransfer.files[0].type.startsWith('image/')) {
        onImagemSelecionada(e.dataTransfer.files[0]);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <label
        htmlFor={`dropzone-file-${Math.random()}`}
        onDragOver={(e) => handleEventosArrastar(e, true)}
        onDragLeave={(e) => handleEventosArrastar(e, false)}
        onDrop={handleSoltar}
        className={`relative flex flex-col items-center justify-center w-full h-80 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-700 transition-colors duration-300 ${arrastando ? 'border-indigo-500 bg-slate-700' : ''}`}
      >
        {previewImagem ? (
          <img src={previewImagem} alt="Preview" className="object-contain w-full h-full rounded-lg" />
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <IconeUpload />
            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Clique para carregar</span> ou arraste e solte</p>
            <p className="text-xs text-gray-500">PNG, JPG, WEBP, etc.</p>
          </div>
        )}
        <input id={`dropzone-file-${Math.random()}`} type="file" className="hidden" accept="image/*" onChange={handleMudancaArquivo} />
      </label>
    </div>
  );
};

interface ImagemGeradaProps {
  urlImagem: string | null;
  carregando: boolean;
}

const ImagemGerada: React.FC<ImagemGeradaProps> = ({ urlImagem, carregando }) => {
  if (carregando) {
    return (
      <div className="w-full h-full min-h-[30rem] rounded-lg bg-slate-800 animate-pulse flex items-center justify-center">
        <p className="text-slate-400">Gerando seu provador virtual...</p>
      </div>
    );
  }

  if (urlImagem) {
    return (
      <div className="w-full h-full min-h-[30rem] rounded-lg bg-slate-800 overflow-hidden">
        <img src={urlImagem} alt="Generated" className="object-contain w-full h-full" />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[30rem] rounded-lg bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center">
      <p className="text-slate-500 text-center">Sua imagem gerada aparecerÃ¡ aqui.</p>
    </div>
  );
};

// --- Componente Principal App --- //
const App: React.FC = () => {
  const [arquivoRoupa, setArquivoRoupa] = useState<File | null>(null);
  const [arquivoPessoa, setArquivoPessoa] = useState<File | null>(null);
  const [previewRoupa, setPreviewRoupa] = useState<string | null>(null);
  const [previewPessoa, setPreviewPessoa] = useState<string | null>(null);
  const [imagemGerada, setImagemGerada] = useState<string | null>(null);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');


  const criarPreview = (arquivo: File, setPreview: (resultado: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(arquivo);
  };

  const handleSelecaoRoupa = useCallback((arquivo: File) => {
    setArquivoRoupa(arquivo);
    criarPreview(arquivo, setPreviewRoupa);
  }, []);

  const handleSelecaoPessoa = useCallback((arquivo: File) => {
    setArquivoPessoa(arquivo);
    criarPreview(arquivo, setPreviewPessoa);
  }, []);

  const handleEnviar = async () => {
    if (!arquivoRoupa || !arquivoPessoa) {
      setErro('Por favor, carregue a imagem da modelo e da influencer.');
      return;
    }
    setErro(null);
    setCarregando(true);
    setImagemGerada(null);

    try {
      const urlImagemResultado = await transferirRoupa(arquivoRoupa, arquivoPessoa, aspectRatio);
      setImagemGerada(urlImagemResultado);
    } catch (e: any) {
      setErro(e.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setCarregando(false);
    }
  };

  const handleLimpar = () => {
    setArquivoRoupa(null);
    setArquivoPessoa(null);
    setPreviewRoupa(null);
    setPreviewPessoa(null);
    setImagemGerada(null);
    setErro(null);
  };

  const handleDownload = () => {
      if (!imagemGerada) return;
      const link = document.createElement('a');
      link.href = imagemGerada;
      const mimeType = imagemGerada.split(';')[0].split(':')[1];
      const extensao = mimeType.split('/')[1] || 'png';
      link.download = `provador-virtual-${Date.now()}.${extensao}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

  const nadaParaLimpar = !arquivoRoupa && !arquivoPessoa && !imagemGerada && !erro;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
            LOOKSWAP
          </h1>
          <p className="mt-2 text-lg text-slate-400">Transfira roupas de uma imagem para outra com um Ãºnico clique.</p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Coluna de Entrada */}
          <div className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-slate-300">1. Carregar Imagem da Modelo</h2>
              <UploaderImagem onImagemSelecionada={handleSelecaoRoupa} previewImagem={previewRoupa} />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-slate-300">2. Carregar Imagem da influencer</h2>
              <UploaderImagem onImagemSelecionada={handleSelecaoPessoa} previewImagem={previewPessoa} />
            </div>
             <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-slate-300">3. Escolher ProporÃ§Ã£o</h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => setAspectRatio('9:16')}
                  className={`flex-1 px-4 py-3 text-base font-semibold rounded-md transition-all duration-200 ${
                    aspectRatio === '9:16'
                      ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Retrato (9:16)
                </button>
                <button
                  onClick={() => setAspectRatio('16:9')}
                  className={`flex-1 px-4 py-3 text-base font-semibold rounded-md transition-all duration-200 ${
                    aspectRatio === '16:9'
                      ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Paisagem (16:9)
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <button
                onClick={handleEnviar}
                disabled={carregando || !arquivoRoupa || !arquivoPessoa}
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
              >
                {carregando ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Gerando...
                  </>
                ) : (
                  <>
                    <IconeVARINHA />
                    Gerar Provador
                  </>
                )}
              </button>
              <button
                onClick={handleLimpar}
                disabled={carregando || nadaParaLimpar}
                className="w-full flex items-center justify-center px-6 py-3 border border-slate-600 text-base font-medium rounded-md text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-700 disabled:cursor-not-allowed disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-slate-500 transition-all duration-300"
              >
                <IconeLimpar />
                Limpar
              </button>
            </div>
          </div>

          {/* Coluna de SaÃ­da */}
          <div className="flex flex-col space-y-4">
            <div>
              <h2 className="text-2xl font-semibold mb-3 text-slate-300">4. Resultado</h2>
              <ImagemGerada urlImagem={imagemGerada} carregando={carregando} />
            </div>
             {imagemGerada && !carregando && (
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-green-500 transition-all duration-300 transform hover:scale-105"
              >
                <IconeDownload />
                Baixar Imagem
              </button>
            )}
            {erro && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
                <strong className="font-bold">Opa! </strong>
                <span className="block sm:inline">{erro}</span>
              </div>
            )}
          </div>
        </main>

        <footer className="text-center mt-12 text-slate-500">
          <p>Desenvolvido por Marcos Melo Inc 2025.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
