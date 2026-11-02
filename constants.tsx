import React from 'react';
import { AppDefinition } from './types';
import CmdApp from './components/apps/CmdApp';
import BrowserApp from './components/apps/BrowserApp';
import DataSpireExplorerApp from './components/apps/DataSpireExplorerApp';
import NotepadApp from './components/apps/NotepadApp';
import PaintApp from './components/apps/PaintApp';
import MediaPlayerApp from './components/apps/MediaPlayerApp';
import CalculatorApp from './components/apps/CalculatorApp';
import SystemMonitorApp from './components/apps/SystemMonitorApp';
import SettingsApp from './components/apps/SettingsApp';
import TrashApp from './components/apps/TrashApp';
import DeviceManagerApp from './components/apps/DeviceManagerApp';

// --- Windows 10 & App Icons ---

export const WindowsLogoIcon: React.FC = () => (
    <svg viewBox="0 0 88 88" className="w-full h-full fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 12.402l35.689-4.86.016 34.423-35.67.203zm35.67 33.529l.029 34.453-35.67-4.891-.029-29.359zm4.327-39.027l47.994-6.904v41.671l-47.994.229zm47.999 38.835v41.716l-47.994-6.758v-34.958z" />
    </svg>
);

export const ChromeIcon: React.FC = () => (
    <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="10" fill="#ffffff" />
        <path fill="#ea4335" d="M24 14h18.2C38.6 8.3 31.8 4 24 4c-7 0-13.3 3.5-17.2 8.8l9.1 15.8c1.7-8.4 4.5-14.6 8.1-14.6z" />
        <path fill="#fbbc05" d="M34.7 24l-9.1 15.8c-1.6.2-3.2.2-4.8 0l9.1-15.8c2.9 5.1 8.2 8.7 14.3 9.7L34.7 24z" />
        <path fill="#34a853" d="M6.8 12.8L15.9 28.6c-1.8 3.1-2.9 6.8-2.9 10.6 0 1.6.2 3.2.5 4.8L24 44c11 0 20-9 20-20h-9.3c0 6.6-4.6 12.1-10.9 13.5L6.8 12.8z" />
        <circle cx="24" cy="24" r="7.5" fill="#1a73e8" />
    </svg>
);

export const ExplorerIcon: React.FC = () => (
    <svg className="w-full h-full text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-1.5V9a3 3 0 00-3-3h-3.379a3 3 0 01-2.121-.879L8.379 4.12A3 3 0 006.257 3.24H4.5A3 3 0 001.5 6.24v11.76a3 3 0 003 3h15z" />
    </svg>
);

export const NotepadIcon: React.FC = () => (
    <svg className="w-full h-full text-blue-500" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zM9.75 14.25a.75.75 0 000 1.5H15a.75.75 0 000-1.5H9.75zM9.75 10.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" clipRule="evenodd" />
    </svg>
);

export const EditorIcon = NotepadIcon;

export const PaintIcon: React.FC = () => (
    <svg className="w-full h-full text-amber-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.55 0 1-.45 1-1 0-.25-.1-.48-.26-.64-.16-.16-.24-.38-.24-.61 0-.55.45-1 1-1h1.5c3.04 0 5.5-2.46 5.5-5.5 0-5.25-4.75-9.25-9.5-9.25zm-5.5 10c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
    </svg>
);

export const MediaPlayerIcon: React.FC = () => (
    <svg className="w-full h-full text-orange-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
    </svg>
);

export const CalculatorIcon: React.FC = () => (
    <svg className="w-full h-full text-cyan-500" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M6 3a3 3 0 00-3 3v12a3 3 0 003 3h12a3 3 0 003-3V6a3 3 0 00-3-3H6zm1.5 3a1.5 1.5 0 00-1.5 1.5v1.5a1.5 1.5 0 001.5 1.5h9A1.5 1.5 0 0018 9V7.5A1.5 1.5 0 0016.5 6h-9zm-1.5 6a1 1 0 011-1h2a1 1 0 110 2H7a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm-10 4a1 1 0 011-1h2a1 1 0 110 2H7a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm5 0a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
);

export const CmdIcon: React.FC = () => (
    <div className="w-full h-full bg-black border border-gray-500 text-white font-mono flex items-center justify-center font-bold text-xs rounded-sm shadow-sm">
        &gt;_
    </div>
);

export const MonitorIcon: React.FC = () => (
    <svg className="w-full h-full text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

export const SettingsIcon: React.FC = () => (
    <svg className="w-full h-full text-gray-400" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.1 5.39c-.838-.309-1.77.108-2.115.942l-.97 2.34c-.345.834.025 1.782.84 2.15l1.097.496c.142.064.22.215.22.366 0 .332 0 .665.02 1.002 0 .151-.078.302-.22.366l-1.097.496c-.815.368-1.185 1.316-.84 2.15l.97 2.34c.345.834 1.277 1.251 2.115.942l1.218-.5c.116-.043.284-.032.45.083.313.217.643.408.986.57.182.088.277.228.297.348l.178 1.072c.151.904.933 1.567 1.85 1.567h2.544c.917 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.115-.26.297-.348.343-.162.673-.353.986-.57.166-.115.334-.126.45-.083l1.218.5c.838.309 1.77-.108 2.115-.942l.97-2.34c.345-.834-.025-1.782-.84-2.15l-1.097-.496c-.142-.064-.22-.215-.22-.366a8.47 8.47 0 00-.02-1.002c0-.151.078-.302.22-.366l1.097-.496c.815-.368 1.185-1.316.84-2.15l-.97-2.34c-.345-.834-1.277-1.251-2.115-.942l-1.218.5c-.116.043-.284.032-.45-.083a7.49 7.49 0 00-.986-.57c-.182-.088-.277-.228-.297-.348l-.178-1.072a1.875 1.875 0 00-1.85-1.567h-2.544zM12 15a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);

export const BrainIcon = SettingsIcon;

export const TrashIcon: React.FC = () => (
    <svg className="w-full h-full text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.904a.75.75 0 00-1.5.058l.5 8.5a.75.75 0 001.5-.058l-.5-8.5zm5.482.058a.75.75 0 10-1.498-.058l-.5 8.5a.75.75 0 001.498.058l.5-8.5z" clipRule="evenodd" />
    </svg>
);

export const DeviceIcon: React.FC = () => (
    <svg className="w-full h-full text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4h16a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 15h16v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-1z" />
    </svg>
);

export const DeleteIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-full w-full">
        <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
);

// --- Widons 2.0 App Definitions ---
export const ALL_APPS: AppDefinition[] = [
    {
        id: 'explorer',
        name: 'Explorador de Arquivos',
        icon: <ExplorerIcon />,
        component: DataSpireExplorerApp,
        category: 'Core',
        description: 'Gerencie seus arquivos, pastas e discos do Windows 10.',
        allowMultipleInstances: true,
        pinned: true
    },
    {
        id: 'browser',
        name: 'Google Chrome',
        icon: <ChromeIcon />,
        component: BrowserApp,
        category: 'Core',
        description: 'Navegue na web e baixe/execute qualquer conteúdo diretamente.',
        allowMultipleInstances: true,
        pinned: true
    },
    {
        id: 'notepad',
        name: 'Bloco de Notas',
        icon: <NotepadIcon />,
        component: NotepadApp,
        opensFileTypes: ['.txt', '.log', '.md', '.json', '.js', '.html'],
        category: 'Core',
        description: 'Editor de texto simples e rápido do Widons.',
        allowMultipleInstances: true,
        pinned: true
    },
    {
        id: 'paint',
        name: 'Paint',
        icon: <PaintIcon />,
        component: PaintApp,
        opensFileTypes: ['.png', '.jpg', '.jpeg', '.svg'],
        category: 'Core',
        description: 'Crie e edite desenhos e imagens.',
        allowMultipleInstances: true,
        pinned: true
    },
    {
        id: 'mediaplayer',
        name: 'Reprodutor de Mídia',
        icon: <MediaPlayerIcon />,
        component: MediaPlayerApp,
        opensFileTypes: ['.mp3', '.wav', '.ogg', '.mp4'],
        category: 'Entertainment',
        description: 'Reproduza músicas, áudios e vídeos.',
        allowMultipleInstances: false,
        pinned: true
    },
    {
        id: 'devices',
        name: 'Gerenciador de Dispositivos (Wi-Fi/Bluetooth)',
        icon: <DeviceIcon />,
        component: DeviceManagerApp,
        category: 'Utilities',
        description: 'Reconhece e configura adaptadores Wi-Fi, Bluetooth e periféricos automaticamente.',
        allowMultipleInstances: false,
        pinned: true
    },
    {
        id: 'calculator',
        name: 'Calculadora',
        icon: <CalculatorIcon />,
        component: CalculatorApp,
        category: 'Core',
        description: 'Calculadora padrão do Windows.',
        allowMultipleInstances: false
    },
    {
        id: 'trash',
        name: 'Lixeira',
        icon: <TrashIcon />,
        component: TrashApp,
        category: 'Core',
        description: 'Visualize e restaure arquivos excluídos.',
        allowMultipleInstances: false
    },
    {
        id: 'terminal',
        name: 'Prompt de Comando (CMD)',
        icon: <CmdIcon />,
        component: CmdApp,
        category: 'Development',
        description: 'Interface de linha de comando padrão do Windows.',
        allowMultipleInstances: true,
        pinned: true
    },
    {
        id: 'monitor',
        name: 'Gerenciador de Tarefas',
        icon: <MonitorIcon />,
        component: SystemMonitorApp,
        category: 'Utilities',
        description: 'Monitore o uso de CPU, memória e processos.',
        allowMultipleInstances: false
    },
    {
        id: 'settings',
        name: 'Configurações',
        icon: <SettingsIcon />,
        component: SettingsApp,
        category: 'Core',
        description: 'Personalize o Widons 2.0.',
        allowMultipleInstances: false
    }
];

export const CORE_APPS = ALL_APPS.filter(app => !app.isInstallable);

export const getAppById = (id: string): AppDefinition | undefined => {
    return ALL_APPS.find(app => app.id === id);
};

export const APPS = CORE_APPS;