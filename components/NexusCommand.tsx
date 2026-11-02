import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AppDefinition, CommandResult } from '../types';
import * as VFS from '../services/virtualFileSystem';
import { generateQuickAnswer, QuickAnswerResponse } from '../services/geminiService';
import { ExplorerIcon, EditorIcon, CalculatorIcon, BrainIcon } from '../constants';

interface NexusCommandProps {
    apps: AppDefinition[];
    onOpenApp: (app: AppDefinition) => void;
    onOpenPath: (path: string) => void;
    onClose: () => void;
    addNotification: (title: string, message: string) => void;
}

const NexusCommand: React.FC<NexusCommandProps> = ({ apps, onOpenApp, onOpenPath, onClose, addNotification }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<CommandResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [aiAnswer, setAiAnswer] = useState<QuickAnswerResponse | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const DirectoryIcon = () => <div className="w-full h-full text-cyan-300"><ExplorerIcon /></div>;
    const FileIcon = () => <div className="w-full h-full text-cyan-300"><EditorIcon /></div>;

    const reset = useCallback(() => {
        setQuery('');
        setResults([]);
        setSelectedIndex(0);
        setIsLoading(false);
        setAiAnswer(null);
    }, []);
    
    const handleClose = useCallback(() => {
        reset();
        onClose();
    }, [onClose, reset]);

    const performAction = useCallback((action: () => void) => {
        action();
        handleClose();
    }, [handleClose]);
    
    const evaluateMath = (expr: string): string | null => {
        try {
            if (/[^0-9\s()*/%+-.]/.test(expr)) return null;
            // eslint-disable-next-line no-eval
            const result = eval(expr);
            return String(result);
        } catch (e) {
            return null;
        }
    };
    
    useEffect(() => {
        if (aiAnswer) return;

        if (query.trim() === '') {
            setResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();
        let newResults: CommandResult[] = [];

        // 1. Search Apps
        const appResults = apps
            .filter(app => app.name.toLowerCase().includes(lowerQuery))
            .map(app => ({
                id: `app-${app.id}`,
                type: 'app' as const,
                title: app.name,
                description: 'Aplicativo',
                icon: <div className="w-full h-full text-[var(--accent-color)]">{app.icon}</div>,
                action: () => onOpenApp(app)
            }));
        newResults.push(...appResults);

        // 2. Search Filesystem
        const vfsResults = VFS.search(query).map(({ node, path }) => ({
            id: `vfs-${path}`,
            type: node.type as 'file' | 'directory',
            title: node.name,
            description: path,
            icon: node.type === 'directory' ? <DirectoryIcon /> : <FileIcon />,
            action: () => onOpenPath(path)
        }));
        newResults.push(...vfsResults);
        
        // 3. Check for math
        const mathResult = evaluateMath(query);
        if (mathResult !== null) {
            newResults.unshift({
                id: `calc-${query}`,
                type: 'action',
                title: mathResult,
                description: 'Cálculo (clique para copiar)',
                icon: <div className="w-full h-full text-green-400"><CalculatorIcon/></div>,
                action: () => {
                    navigator.clipboard.writeText(mathResult);
                    addNotification('Calculadora', `Resultado "${mathResult}" copiado para a área de transferência.`);
                }
            });
        }

        // 4. Add Web Search via Google Chrome
        newResults.push({
            id: `web-${query}`,
            type: 'action',
            title: `Pesquisar na Web: "${query}"`,
            description: 'Pesquisar com Google Chrome',
            icon: (
                <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" fill="#4285F4"/>
                        <circle cx="12" cy="12" r="4" fill="#ffffff"/>
                        <path d="M12 2a10 10 0 0 1 8.66 5l-4.33 7.5A5 5 0 0 0 12 7V2z" fill="#EA4335"/>
                        <path d="M20.66 7A10 10 0 0 1 12 22l4.33-7.5a5 5 0 0 0 4.33-7.5z" fill="#FBBC05"/>
                        <path d="M12 22A10 10 0 0 1 3.34 7l4.33 7.5a5 5 0 0 0 4.33 7.5z" fill="#34A853"/>
                    </svg>
                </div>
            ),
            action: async () => {
                const chromeApp = apps.find(a => a.id === 'chrome');
                if (chromeApp) {
                    onOpenApp(chromeApp);
                } else {
                    setIsLoading(true);
                    const answer = await generateQuickAnswer(query);
                    setAiAnswer(answer);
                    setIsLoading(false);
                }
            }
        });

        setResults(newResults);
        setSelectedIndex(0);

    }, [query, apps, onOpenApp, onOpenPath, addNotification, aiAnswer]);
    
    const groupedResults = useMemo(() => {
        return results.reduce((acc, result) => {
            let groupTitle = '';
            switch(result.type) {
                case 'app': groupTitle = 'Aplicativos'; break;
                case 'file': case 'directory': groupTitle = 'Arquivos e Pastas'; break;
                case 'action': groupTitle = 'Ações'; break;
                default: groupTitle = 'Resultados'; break;
            }
            if (!acc[groupTitle]) {
                acc[groupTitle] = [];
            }
            acc[groupTitle].push(result);
            return acc;
        }, {} as Record<string, CommandResult[]>);
    }, [results]);


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (results.length > 0 && !aiAnswer) {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setSelectedIndex(prev => (prev + 1) % results.length);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    const selectedResult = results[selectedIndex];
                    if (selectedResult) {
                        performAction(selectedResult.action);
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [results, selectedIndex, performAction, aiAnswer]);
    
     useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const ResultList = () => {
        let flatIndex = -1;
        const groupOrder = ['Ações', 'Aplicativos', 'Arquivos e Pastas'];
        
        return (
            <div className="mt-2 space-y-2">
                {groupOrder.map(groupTitle => {
                    const groupItems = groupedResults[groupTitle];
                    if (!groupItems) return null;
                    
                    return (
                        <div key={groupTitle}>
                            <h3 className="px-3 py-1 text-xs font-bold text-gray-400 uppercase">{groupTitle}</h3>
                            <ul className="space-y-1">
                                {groupItems.map((res) => {
                                    flatIndex++;
                                    const currentIndex = flatIndex;
                                    return (
                                        <li
                                            key={res.id}
                                            onClick={() => performAction(res.action)}
                                            onMouseMove={() => setSelectedIndex(currentIndex)}
                                            className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors duration-100 mx-1 ${
                                            selectedIndex === currentIndex ? 'bg-[rgba(var(--accent-color-rgb),0.2)]' : 'bg-transparent'
                                            }`}
                                        >
                                            <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">{res.icon}</div>
                                            <div className="overflow-hidden">
                                            <p className="font-bold text-white truncate">{res.title}</p>
                                            <p className="text-sm text-gray-400 truncate">{res.description}</p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </div>
        );
    };

    const AnswerView = () => (
      <div className="mt-4 p-3 text-white/90">
         <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: aiAnswer!.text.replace(/\n/g, '<br />') }}></div>
          {aiAnswer?.sources && aiAnswer.sources.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[rgba(var(--accent-color-rgb),0.3)]">
                  <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Fontes</h4>
                  <ul className="space-y-1">
                      {aiAnswer.sources.map((source, i) => (
                          <li key={i}>
                              <a
                                href={source.uri}
                                onClick={(e) => { e.preventDefault(); onOpenPath(source.uri); handleClose(); }}
                                className="text-xs text-cyan-400 hover:underline truncate block"
                                title={source.uri}
                                >
                                {source.title || source.uri}
                               </a>
                          </li>
                      ))}
                  </ul>
              </div>
          )}
      </div>
    );

    return createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex justify-center animate-scale-in" onClick={handleClose}>
            <div 
                className="w-full max-w-2xl mt-[15vh] bg-black/80 border border-[var(--accent-color)] rounded-xl shadow-2xl shadow-[rgba(var(--accent-color-rgb),0.3)] h-min max-h-[70vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 flex items-center gap-4 border-b border-[rgba(var(--accent-color-rgb),0.3)]">
                     <div className="w-6 h-6 flex-shrink-0 text-[var(--accent-color)]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                     </div>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setAiAnswer(null); }}
                        placeholder="Digite aqui para pesquisar (aplicativos, arquivos, web)..."
                        className="w-full bg-transparent text-lg text-white focus:outline-none placeholder-gray-400"
                        disabled={isLoading}
                    />
                     {isLoading && (
                        <div className="w-5 h-5 border-2 border-transparent border-t-[var(--accent-color)] rounded-full animate-spin"></div>
                     )}
                </div>
                <div className="overflow-y-auto p-2">
                    {aiAnswer ? <AnswerView /> : (results.length > 0 ? <ResultList /> : null)}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default NexusCommand;