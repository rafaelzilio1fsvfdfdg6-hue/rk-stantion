import React, { useState, useMemo } from 'react';
import { AppDefinition } from '../types';

interface StartMenuProps {
    apps: AppDefinition[];
    onOpenApp: (app: AppDefinition) => void;
    onContextMenu: (e: React.MouseEvent, target: { type: string; appId: string }) => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ apps, onOpenApp, onContextMenu }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredApps = useMemo(() => {
        if (!searchTerm) return apps;
        return apps.filter(app => app.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [apps, searchTerm]);

    // Group apps by starting letter
    const groupedApps = useMemo(() => {
        const groups: Record<string, AppDefinition[]> = {};
        const sorted = [...filteredApps].sort((a, b) => a.name.localeCompare(b.name));
        for (const app of sorted) {
            const letter = app.name.charAt(0).toUpperCase();
            if (!groups[letter]) groups[letter] = [];
            groups[letter].push(app);
        }
        return groups;
    }, [filteredApps]);

    const liveTiles = [
        { id: 'browser', name: 'Google Chrome', color: 'bg-gradient-to-tr from-blue-700 to-indigo-800', desc: 'Navegador Web' },
        { id: 'explorer', name: 'Explorador de Arquivos', color: 'bg-gradient-to-tr from-yellow-600 to-amber-700', desc: 'Este Computador' },
        { id: 'devices', name: 'Wi-Fi & Bluetooth', color: 'bg-gradient-to-tr from-emerald-600 to-teal-800', desc: 'Adaptadores Online' },
        { id: 'notepad', name: 'Bloco de Notas', color: 'bg-gradient-to-tr from-sky-600 to-blue-800', desc: 'Documentos' },
        { id: 'paint', name: 'Paint 10', color: 'bg-gradient-to-tr from-rose-600 to-pink-700', desc: 'Criar Arte' },
        { id: 'mediaplayer', name: 'Reprodutor de Mídia', color: 'bg-gradient-to-tr from-orange-600 to-amber-800', desc: 'Músicas e Sons' },
        { id: 'terminal', name: 'Prompt de Comando', color: 'bg-gradient-to-tr from-zinc-800 to-stone-900', desc: 'CMD.EXE' },
        { id: 'settings', name: 'Configurações', color: 'bg-gradient-to-tr from-slate-700 to-gray-800', desc: 'Widons 2.0' },
    ];

    return (
        <div
            className="start-menu absolute bottom-14 left-0 w-[640px] max-w-[calc(100vw-1rem)] h-[520px] max-h-[calc(100vh-5rem)] bg-[#10141d]/95 backdrop-blur-2xl border border-white/10 rounded-tr-lg shadow-2xl z-50 flex overflow-hidden select-none"
            onClick={e => e.stopPropagation()}
        >
            {/* Leftmost Slim Utility Rail */}
            <div className="w-12 bg-black/40 border-r border-white/5 flex flex-col justify-between items-center py-3 flex-shrink-0">
                <div className="flex flex-col gap-3">
                    <button
                        title="Usuário Widons"
                        className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs"
                    >
                        U
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => {
                            const settingsApp = apps.find(a => a.id === 'settings');
                            if (settingsApp) onOpenApp(settingsApp);
                        }}
                        title="Configurações"
                        className="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition"
                    >
                        ⚙️
                    </button>
                    <button
                        onClick={() => {
                            if (confirm('Deseja reiniciar o Widons 2.0?')) {
                                window.location.reload();
                            }
                        }}
                        title="Ligar / Desligar"
                        className="w-8 h-8 rounded hover:bg-red-600/30 flex items-center justify-center text-gray-400 hover:text-red-400 transition text-sm"
                    >
                        ⏻
                    </button>
                </div>
            </div>

            {/* Middle Column: Alphabetical App List */}
            <div className="w-60 bg-[#161a24]/60 border-r border-white/5 flex flex-col p-3 overflow-hidden flex-shrink-0">
                {/* Search in Start Menu */}
                <div className="relative mb-3">
                    <input
                        type="text"
                        placeholder="Buscar aplicativos..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded px-3 py-1.5 text-xs text-white placeholder-gray-400 focus:outline-none"
                    />
                </div>

                {/* App list with letters */}
                <div className="flex-grow overflow-y-auto space-y-3 pr-1 text-xs">
                    {Object.keys(groupedApps).map(letter => (
                        <div key={letter}>
                            <span className="text-[11px] font-bold text-blue-400 px-2 py-0.5 block border-b border-white/5 mb-1">
                                {letter}
                            </span>
                            <div className="space-y-0.5">
                                {groupedApps[letter].map(app => (
                                    <button
                                        key={app.id}
                                        onClick={() => onOpenApp(app)}
                                        onContextMenu={e => onContextMenu(e, { type: 'app', appId: app.id })}
                                        className="w-full flex items-center gap-2.5 p-2 rounded hover:bg-white/10 text-left transition-colors text-white"
                                    >
                                        <div className="w-5 h-5 flex-shrink-0">{app.icon}</div>
                                        <span className="truncate font-medium">{app.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Windows 10 Live Tiles */}
            <div className="flex-grow p-4 bg-[#10141d]/40 overflow-y-auto">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    Produtividade &amp; Conexões
                </h4>

                <div className="grid grid-cols-2 gap-2.5">
                    {liveTiles.map(tile => {
                        const app = apps.find(a => a.id === tile.id);
                        if (!app) return null;

                        return (
                            <button
                                key={tile.id}
                                onClick={() => onOpenApp(app)}
                                className={`h-24 p-3 rounded-lg text-left transition-all duration-200 transform hover:scale-[1.02] shadow-lg flex flex-col justify-between ${tile.color} border border-white/10 hover:border-white/30`}
                            >
                                <div className="w-7 h-7">{app.icon}</div>
                                <div>
                                    <h5 className="font-bold text-xs text-white truncate">{app.name}</h5>
                                    <p className="text-[10px] text-white/80">{tile.desc}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default StartMenu;