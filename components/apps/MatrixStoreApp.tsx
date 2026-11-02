import React, { useState, useMemo } from 'react';
import { ALL_APPS } from '../../constants';
import { AppDefinition } from '../../types';

interface MatrixStoreAppProps {
    installApp: (appId: string) => void;
    installedApps: AppDefinition[];
}

const AppCard: React.FC<{ app: AppDefinition; onInstall: () => void; isInstalled: boolean }> = ({ app, onInstall, isInstalled }) => {
    const [isInstalling, setIsInstalling] = useState(false);

    const handleInstall = () => {
        setIsInstalling(true);
        setTimeout(() => {
            onInstall();
            setIsInstalling(false);
        }, 1500); // Simulate install time
    };

    return (
        <div className="bg-black/50 p-4 rounded-lg border border-[rgba(var(--accent-color-rgb),0.2)] flex flex-col gap-3">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 text-[var(--accent-color)] flex-shrink-0">{app.icon}</div>
                <div>
                    <h3 className="font-bold text-lg text-white">{app.name}</h3>
                    <p className="text-xs text-gray-400">{app.category}</p>
                </div>
            </div>
            <p className="text-sm text-gray-300 flex-grow">{app.description}</p>
            <div className="h-10">
                {isInstalling ? (
                     <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                         <div className="bg-[var(--accent-color)] h-2.5 rounded-full animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]" style={{width: '100%'}}></div>
                     </div>
                ) : (
                    <button 
                        onClick={handleInstall}
                        disabled={isInstalled}
                        className="w-full px-4 py-2 bg-[var(--accent-color)] text-black font-bold rounded-md hover:brightness-110 transition-colors disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                        {isInstalled ? 'Instalado' : 'Instalar'}
                    </button>
                )}
            </div>
        </div>
    );
};


const MatrixStoreApp: React.FC<MatrixStoreAppProps> = ({ installApp, installedApps }) => {
    const [selectedCategory, setSelectedCategory] = useState<'All' | AppDefinition['category']>('All');
    const storeApps = useMemo(() => ALL_APPS.filter(app => app.isInstallable), []);
    
    const categories = useMemo(() => {
        const cats = new Set(storeApps.map(a => a.category));
        return ['All', ...Array.from(cats)].filter(Boolean) as ('All' | AppDefinition['category'])[];
    }, [storeApps]);

    const filteredApps = useMemo(() => {
        if (selectedCategory === 'All') return storeApps;
        return storeApps.filter(app => app.category === selectedCategory);
    }, [selectedCategory, storeApps]);

    const installedIds = new Set(installedApps.map(a => a.id));
    const coreAppIds = new Set(ALL_APPS.filter(a => !a.isInstallable).map(a => a.id));

    return (
        <div className="h-full flex flex-col bg-gray-900/50 text-cyan-300 font-sans">
            <div className="p-4 flex-shrink-0">
                <h2 className="text-3xl font-orbitron text-[var(--accent-color)]">Loja de Aplicativos Matrix</h2>
                <p>Expanda seu sistema com novos aplicativos e ferramentas.</p>
            </div>
            
            <div className="px-4 pb-2 flex-shrink-0 border-b-2 border-[rgba(var(--accent-color-rgb),0.3)]">
                <nav className="flex space-x-4">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-3 py-2 text-sm font-bold rounded-t-lg transition-colors ${selectedCategory === cat ? 'bg-[rgba(var(--accent-color-rgb),0.2)] text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            {cat === 'All' ? 'Todos' : cat}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex-grow p-4 overflow-y-auto">
                 {filteredApps.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredApps.map(app => (
                            <AppCard 
                                key={app.id} 
                                app={app} 
                                onInstall={() => installApp(app.id)}
                                isInstalled={installedIds.has(app.id) || coreAppIds.has(app.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-400 text-lg">Nenhum aplicativo novo disponível na Matriz no momento.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatrixStoreApp;