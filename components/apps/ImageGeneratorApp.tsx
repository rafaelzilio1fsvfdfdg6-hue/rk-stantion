import React, { useState, useCallback } from 'react';
import { generateImage } from '../../services/geminiService';

const ImageGeneratorApp: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mainImageUrl, setMainImageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<string[]>([]);

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim() || isLoading) return;
        
        setIsLoading(true);
        setError(null);
        setMainImageUrl(null);

        const result = await generateImage(prompt);

        if (result) {
            setMainImageUrl(result);
            setHistory(prev => [result, ...prev]);
        } else {
            setError('Falha ao gerar imagem. A matriz de IA pode estar instável. Por favor, tente novamente.');
        }
        setIsLoading(false);
    }, [prompt, isLoading]);

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleGenerate();
    };

    return (
        <div className="h-full flex flex-col bg-gray-900/50 text-cyan-300 p-4 font-sans gap-4">
            <h2 className="text-2xl font-orbitron text-[var(--accent-color)] mb-2 border-b-2 border-[rgba(var(--accent-color-rgb),0.5)] pb-2">Sintetizador de Imagens ReVision</h2>
            
            <form onSubmit={handleFormSubmit} className="flex flex-col md:flex-row gap-4">
                <input 
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Descreva uma visão..."
                    className="flex-grow bg-black/50 border border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)] focus:outline-none rounded-md px-4 py-2 text-white placeholder-gray-400 transition"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className="px-6 py-2 bg-[var(--accent-color)] text-black font-bold rounded-md hover:brightness-110 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 shadow-[0_0_10px_rgba(var(--accent-color-rgb),0.3)]"
                    disabled={isLoading || !prompt.trim()}
                >
                    {isLoading ? 'Sintetizando...' : 'Gerar'}
                </button>
            </form>

            <div className="flex-grow flex gap-4">
                <div className="w-3/4 flex-grow bg-black/70 rounded-lg flex items-center justify-center border border-[rgba(var(--accent-color-rgb),0.3)] overflow-hidden">
                    {isLoading && (
                        <div className="flex flex-col items-center text-[var(--accent-color)]">
                            <svg className="animate-spin h-10 w-10" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="mt-4 text-lg">Conectando ao córtex visual...</p>
                        </div>
                    )}
                    {error && <p className="text-red-400 p-4 text-center">{error}</p>}
                    {!isLoading && mainImageUrl && (
                        <img src={mainImageUrl} alt={prompt || 'Imagem gerada'} className="object-contain max-w-full max-h-full" />
                    )}
                     {!isLoading && !mainImageUrl && !error && (
                        <p className="text-gray-400">Sua imagem gerada aparecerá aqui.</p>
                    )}
                </div>
                <div className="w-1/4 flex flex-col gap-2 bg-black/50 p-2 rounded-lg border border-[rgba(var(--accent-color-rgb),0.3)]">
                    <h3 className="text-center font-bold text-sm mb-1">Histórico</h3>
                    <div className="flex-grow overflow-y-auto space-y-2">
                        {history.map((imgUrl, index) => (
                             <img 
                                key={index} 
                                src={imgUrl} 
                                alt={`Imagem do histórico ${index}`}
                                className="w-full h-auto rounded-md cursor-pointer border-2 border-transparent hover:border-[var(--accent-color)]"
                                onClick={() => setMainImageUrl(imgUrl)}
                             />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageGeneratorApp;