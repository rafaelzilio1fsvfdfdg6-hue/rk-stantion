import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as VFS from '../../services/virtualFileSystem';

interface DownloadRecord {
    id: string;
    filename: string;
    size: string;
    date: number;
    url?: string;
    content: string;
    type: 'html' | 'image' | 'text' | 'code' | 'doc';
}

const ChromeIconSvg: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg viewBox="0 0 48 48" className={className} xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="10" fill="#ffffff" />
        <path fill="#ea4335" d="M24 14h18.2C38.6 8.3 31.8 4 24 4c-7 0-13.3 3.5-17.2 8.8l9.1 15.8c1.7-8.4 4.5-14.6 8.1-14.6z" />
        <path fill="#fbbc05" d="M34.7 24l-9.1 15.8c-1.6.2-3.2.2-4.8 0l9.1-15.8c2.9 5.1 8.2 8.7 14.3 9.7L34.7 24z" />
        <path fill="#34a853" d="M6.8 12.8L15.9 28.6c-1.8 3.1-2.9 6.8-2.9 10.6 0 1.6.2 3.2.5 4.8L24 44c11 0 20-9 20-20h-9.3c0 6.6-4.6 12.1-10.9 13.5L6.8 12.8z" />
        <circle cx="24" cy="24" r="7.5" fill="#1a73e8" />
    </svg>
);

const PRESET_DOWNLOADS = [
    {
        name: 'Widons_Wallpaper_4K.svg',
        type: 'image' as const,
        size: '128 KB',
        desc: 'Papel de parede oficial com arte neon cyberpunk Widons 2.0',
        content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="100%" height="100%"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#050515"/><stop offset="50%" stop-color="#0a1a3a"/><stop offset="100%" stop-color="#001525"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="960" y="540" font-family="sans-serif" font-size="84" font-weight="900" fill="#00f0ff" text-anchor="middle" letter-spacing="10">WIDONS 2.0</text><text x="960" y="620" font-family="sans-serif" font-size="28" fill="#ff00e6" text-anchor="middle">NEXT-GEN CYBER OS</text></svg>`
    },
    {
        name: 'Guia_Widons_2.0.txt',
        type: 'doc' as const,
        size: '4 KB',
        desc: 'Manual completo de comandos, atalhos de teclado e recursos do Widons',
        content: `=== MANUAL DO USUÁRIO - WIDONS 2.0 ===\n\n1. Atalhos:\n- Ctrl + K: Abrir Comando Nexus\n- Botão Iniciar: Menu de aplicativos\n- Arrastar abas: Reorganize ou separe janelas\n\n2. Google Chrome:\n- Baixe páginas, imagens e arquivos com 1 clique.\n- Os downloads vão para /home/user/Downloads e para o seu computador real.\n\n3. Lixeira:\n- Arquivos excluídos podem ser recuperados na Lixeira.`
    },
    {
        name: 'script_cyber_matriz.js',
        type: 'code' as const,
        size: '2 KB',
        desc: 'Script de simulação da Matriz Grid para Widons',
        content: `// Widons 2.0 Matrix Automation\nfunction connectGrid() {\n  console.log("Conectando ao núcleo Widons 2.0...");\n  return { status: "ONLINE", latency: "1.2ms", speed: "10 Gbps" };\n}\nconsole.log(connectGrid());`
    },
    {
        name: 'Notas_Desenvolvedor.md',
        type: 'text' as const,
        size: '3 KB',
        desc: 'Anotações de desenvolvimento e ideias para expansão',
        content: `# Widons 2.0 Notes\n\n- [x] Lixeira implementada com restauração\n- [x] Google Chrome integrado com downloads totais\n- [x] Suporte a abas dinâmicas e persistência VFS`
    }
];

const BrowserApp: React.FC<{
    updateVfs?: () => void;
    addNotification?: (title: string, message: string) => void;
    onOpenPath?: (path: string) => void;
}> = ({ updateVfs, addNotification, onOpenPath }) => {
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [addressBarUrl, setAddressBarUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [activeTab, setActiveTab] = useState<'web' | 'downloads'>('web');
    const [downloads, setDownloads] = useState<DownloadRecord[]>(() => {
        try {
            const saved = localStorage.getItem('widons_chrome_downloads');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });
    const [showDownloadShelf, setShowDownloadShelf] = useState(false);
    const [latestDownload, setLatestDownload] = useState<DownloadRecord | null>(null);
    const [customDownloadModal, setCustomDownloadModal] = useState(false);
    const [customFileName, setCustomFileName] = useState('');
    const [customContent, setCustomContent] = useState('');
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const currentUrl = history[historyIndex] || '';

    useEffect(() => {
        localStorage.setItem('widons_chrome_downloads', JSON.stringify(downloads));
    }, [downloads]);

    const triggerDownload = useCallback((filename: string, content: string, type: DownloadRecord['type'] = 'text') => {
        // 1. Save to Widons VFS (/home/user/Downloads)
        VFS.downloadToVFS(filename, content, true);
        updateVfs?.();

        const record: DownloadRecord = {
            id: `dl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            filename,
            size: `${(content.length / 1024).toFixed(1)} KB`,
            date: Date.now(),
            content,
            type,
            url: currentUrl || 'chrome://downloads'
        };

        setDownloads(prev => [record, ...prev]);
        setLatestDownload(record);
        setShowDownloadShelf(true);
        addNotification?.('Google Chrome', `Download concluído: ${filename}`);
    }, [currentUrl, updateVfs, addNotification]);

    const navigate = useCallback((url: string) => {
        if (url === 'chrome://downloads') {
            setActiveTab('downloads');
            setAddressBarUrl('chrome://downloads');
            return;
        }

        setActiveTab('web');
        setIsLoading(true);
        setLoadError(false);
        let fullUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            if (url.includes('.') && !url.includes(' ')) {
                fullUrl = `https://${url}`;
            } else {
                fullUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`;
            }
        }

        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(fullUrl);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setAddressBarUrl(fullUrl);
    }, [history, historyIndex]);

    const goBack = () => {
        if (historyIndex > 0) {
            setLoadError(false);
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            setAddressBarUrl(history[newIndex]);
        }
    };

    const goForward = () => {
        if (historyIndex < history.length - 1) {
            setLoadError(false);
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setAddressBarUrl(history[newIndex]);
        }
    };

    const reload = () => {
        if (currentUrl) {
            setIsLoading(true);
            setLoadError(false);
            if (iframeRef.current) {
                iframeRef.current.src = 'about:blank';
                setTimeout(() => {
                    if (iframeRef.current) iframeRef.current.src = currentUrl;
                }, 10);
            }
        }
    };

    const goHome = () => {
        setActiveTab('web');
        setLoadError(false);
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push('');
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setAddressBarUrl('');
    };

    const handleAddressBarSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigate(addressBarUrl);
    };

    const downloadCurrentPage = () => {
        const title = currentUrl ? currentUrl.replace(/https?:\/\//, '').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30) : 'Google_Chrome_Pagina';
        const filename = `${title}.html`;
        const content = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Página Salva - ${currentUrl || 'Google Chrome'}</title>
    <style>body { font-family: sans-serif; padding: 2rem; background: #0f172a; color: #fff; }</style>
</head>
<body>
    <h1>Página Salva via Google Chrome no Widons 2.0</h1>
    <p><strong>URL Original:</strong> <a href="${currentUrl}" style="color: #38bdf8;">${currentUrl}</a></p>
    <p><strong>Data de Download:</strong> ${new Date().toLocaleString('pt-BR')}</p>
    <hr style="border-color: #334155; margin: 20px 0;"/>
    <p>Este arquivo foi baixado e armazenado com sucesso em <code>/home/user/Downloads/${filename}</code>.</p>
</body>
</html>`;
        triggerDownload(filename, content, 'html');
    };

    const handleCustomDownloadSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customFileName.trim()) return;
        let fn = customFileName.trim();
        if (!fn.includes('.')) fn += '.txt';
        triggerDownload(fn, customContent || `Arquivo baixado no Google Chrome (${fn}) em ${new Date().toLocaleString()}`, 'text');
        setCustomFileName('');
        setCustomContent('');
        setCustomDownloadModal(false);
    };

    const quickLinks = [
        { name: 'Google', url: 'https://google.com', letter: 'G', color: 'bg-blue-600' },
        { name: 'YouTube', url: 'https://youtube.com', letter: 'Y', color: 'bg-red-600' },
        { name: 'Wikipedia', url: 'https://pt.wikipedia.org', letter: 'W', color: 'bg-slate-700' },
        { name: 'GitHub', url: 'https://github.com', letter: 'GH', color: 'bg-gray-800' },
        { name: 'Downloads', url: 'chrome://downloads', letter: '⬇', color: 'bg-emerald-600' },
    ];

    return (
        <div className="h-full flex flex-col bg-[#1e2022] text-gray-200 font-sans selection:bg-blue-500 selection:text-white">
            {/* Top Chrome Tab Strip */}
            <div className="bg-[#292a2d] px-2 pt-2 flex items-center gap-1 border-b border-[#3c4043] select-none flex-shrink-0">
                <button
                    onClick={() => { setActiveTab('web'); }}
                    className={`flex items-center gap-2 max-w-xs px-4 py-2 rounded-t-lg text-xs font-medium transition-all ${
                        activeTab === 'web'
                            ? 'bg-[#35363a] text-white shadow-sm border-t border-x border-[#5f6368]/30'
                            : 'text-gray-400 hover:bg-[#35363a]/50'
                    }`}
                >
                    <ChromeIconSvg className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                        {currentUrl ? (currentUrl.replace(/https?:\/\//, '').substring(0, 25)) : 'Nova Guia - Google Chrome'}
                    </span>
                </button>

                <button
                    onClick={() => { setActiveTab('downloads'); }}
                    className={`flex items-center gap-2 max-w-xs px-4 py-2 rounded-t-lg text-xs font-medium transition-all ${
                        activeTab === 'downloads'
                            ? 'bg-[#35363a] text-white shadow-sm border-t border-x border-[#5f6368]/30'
                            : 'text-gray-400 hover:bg-[#35363a]/50'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Downloads ({downloads.length})</span>
                </button>

                <button
                    onClick={goHome}
                    title="Nova Guia"
                    className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-[#3c4043] hover:text-white transition ml-1"
                >
                    +
                </button>
            </div>

            {/* Chrome Navigation & Toolbar */}
            <div className="bg-[#35363a] p-2 flex items-center gap-1.5 border-b border-[#202124] shadow-md flex-shrink-0">
                <button
                    onClick={goBack}
                    disabled={historyIndex <= 0}
                    title="Voltar"
                    className="p-1.5 rounded-full hover:bg-[#484a4e] text-gray-300 disabled:opacity-30 transition"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button
                    onClick={goForward}
                    disabled={historyIndex >= history.length - 1}
                    title="Avançar"
                    className="p-1.5 rounded-full hover:bg-[#484a4e] text-gray-300 disabled:opacity-30 transition"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                <button
                    onClick={reload}
                    title="Recarregar"
                    className="p-1.5 rounded-full hover:bg-[#484a4e] text-gray-300 transition"
                >
                    <svg className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
                <button
                    onClick={goHome}
                    title="Página Inicial"
                    className="p-1.5 rounded-full hover:bg-[#484a4e] text-gray-300 transition"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                </button>

                {/* Omnibox / Address Bar */}
                <form onSubmit={handleAddressBarSubmit} className="flex-grow relative flex items-center">
                    <div className="absolute left-3 text-gray-400 flex items-center gap-1.5">
                        <ChromeIconSvg className="w-3.5 h-3.5" />
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <input
                        type="text"
                        value={addressBarUrl}
                        onChange={e => setAddressBarUrl(e.target.value)}
                        placeholder="Pesquisar no Google ou digitar um URL"
                        className="w-full bg-[#202124] hover:bg-[#282a2d] focus:bg-[#202124] border border-transparent focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-full pl-16 pr-10 py-1.5 text-sm text-white placeholder-gray-400 transition"
                    />
                </form>

                {/* Download Actions */}
                <button
                    onClick={downloadCurrentPage}
                    title="Baixar esta página (.html)"
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-full bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-300 transition"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    <span className="hidden sm:inline">Baixar Página</span>
                </button>

                <button
                    onClick={() => setCustomDownloadModal(true)}
                    title="Baixar Arquivo / Mídia personalizada"
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-full bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/50 text-emerald-300 transition"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span className="hidden md:inline">Baixar Tudo</span>
                </button>

                <button
                    onClick={() => setActiveTab(t => t === 'downloads' ? 'web' : 'downloads')}
                    title="Ver Downloads"
                    className={`relative p-2 rounded-full transition ${activeTab === 'downloads' ? 'bg-blue-600 text-white' : 'hover:bg-[#484a4e] text-gray-300'}`}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    {downloads.length > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-emerald-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                            {downloads.length > 9 ? '9+' : downloads.length}
                        </span>
                    )}
                </button>
            </div>

            {/* Bookmarks Bar */}
            <div className="bg-[#292a2d] px-3 py-1 flex items-center gap-2 border-b border-[#202124] text-xs text-gray-300 overflow-x-auto flex-shrink-0">
                <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider mr-1">Favoritos:</span>
                {quickLinks.map(link => (
                    <button
                        key={link.name}
                        onClick={() => navigate(link.url)}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-[#3c4043] transition-colors flex-shrink-0"
                    >
                        <span className={`w-3.5 h-3.5 rounded-full ${link.color} text-white flex items-center justify-center text-[9px] font-bold`}>
                            {link.letter}
                        </span>
                        <span>{link.name}</span>
                    </button>
                ))}
            </div>

            {/* Main Area: Web or Downloads */}
            <div className="flex-grow bg-[#202124] relative overflow-hidden flex flex-col">
                {activeTab === 'downloads' ? (
                    /* Chrome Downloads Manager */
                    <div className="h-full flex flex-col p-6 overflow-y-auto max-w-4xl mx-auto w-full">
                        <div className="flex items-center justify-between pb-4 border-b border-[#3c4043] mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Central de Downloads do Google Chrome</h2>
                                    <p className="text-xs text-gray-400">Todos os arquivos são salvos na pasta <code>/home/user/Downloads</code> e no seu PC.</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onOpenPath?.('/home/user/Downloads')}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-md transition flex items-center gap-1.5"
                                >
                                    Abrir Pasta Downloads
                                </button>
                                <button
                                    onClick={() => setDownloads([])}
                                    className="px-3 py-1.5 bg-[#35363a] hover:bg-[#484a4e] text-gray-300 text-xs font-semibold rounded-md transition"
                                >
                                    Limpar Histórico
                                </button>
                            </div>
                        </div>

                        {downloads.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
                                <div className="w-16 h-16 rounded-full bg-[#292a2d] flex items-center justify-center text-gray-500 mb-3">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                </div>
                                <p className="text-base font-semibold text-gray-300">Nenhum download ainda</p>
                                <p className="text-xs text-gray-500 mt-1">Baixe arquivos, papéis de parede ou páginas da web para vê-los aqui.</p>
                                <button
                                    onClick={() => setActiveTab('web')}
                                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition"
                                >
                                    Explorar Galeria da Web
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {downloads.map(dl => (
                                    <div key={dl.id} className="p-4 bg-[#292a2d] hover:bg-[#303236] border border-[#3c4043] rounded-xl flex items-center justify-between gap-4 transition-all">
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-semibold text-white truncate text-sm">{dl.filename}</h4>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {dl.size} • Concluído • {new Date(dl.date).toLocaleTimeString('pt-BR')}
                                                </p>
                                                <p className="text-[11px] text-gray-500 truncate mt-0.5">{dl.url}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => triggerDownload(dl.filename, dl.content, dl.type)}
                                                className="px-3 py-1.5 text-xs bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 rounded-md transition font-medium"
                                            >
                                                Baixar Novamente
                                            </button>
                                            <button
                                                onClick={() => onOpenPath?.(`/home/user/Downloads/${dl.filename}`)}
                                                className="px-3 py-1.5 text-xs bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 rounded-md transition font-medium"
                                            >
                                                Abrir Arquivo
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Web Browser Page */
                    <div className="h-full w-full flex flex-col">
                        {!currentUrl ? (
                            /* Google Chrome New Tab Home */
                            <div className="h-full overflow-y-auto p-6 flex flex-col items-center">
                                {/* Chrome / Google Hero */}
                                <div className="mt-6 mb-8 flex flex-col items-center text-center">
                                    <div className="mb-4">
                                        <ChromeIconSvg className="w-20 h-20 drop-shadow-xl" />
                                    </div>
                                    <h1 className="text-4xl font-extrabold tracking-tight text-white flex items-center gap-2">
                                        <span className="text-[#4285f4]">G</span>
                                        <span className="text-[#ea4335]">o</span>
                                        <span className="text-[#fbbc05]">o</span>
                                        <span className="text-[#4285f4]">g</span>
                                        <span className="text-[#34a853]">l</span>
                                        <span className="text-[#ea4335]">e</span>
                                        <span className="text-cyan-400 ml-1 font-orbitron text-2xl font-normal">Chrome</span>
                                    </h1>
                                    <p className="text-sm text-gray-400 mt-2">Navegue com velocidade e baixe tudo diretamente no Widons 2.0</p>
                                </div>

                                {/* Search Bar */}
                                <div className="w-full max-w-2xl mb-8">
                                    <form onSubmit={handleAddressBarSubmit} className="relative">
                                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                        <input
                                            type="text"
                                            placeholder="Pesquisar no Google ou digitar um URL"
                                            value={addressBarUrl}
                                            onChange={e => setAddressBarUrl(e.target.value)}
                                            className="w-full bg-[#292a2d] hover:bg-[#303236] focus:bg-[#202124] border border-[#3c4043] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 rounded-full pl-12 pr-12 py-3.5 text-white placeholder-gray-400 shadow-xl transition"
                                        />
                                        <button
                                            type="submit"
                                            className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-full transition"
                                        >
                                            Ir
                                        </button>
                                    </form>
                                </div>

                                {/* Web Download Hub - "permite abaixar tudo que tem no crome" */}
                                <div className="w-full max-w-4xl bg-[#292a2d]/80 border border-cyan-800/40 rounded-2xl p-6 shadow-2xl mb-8">
                                    <div className="flex items-center justify-between pb-3 border-b border-[#3c4043] mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                            </div>
                                            <h3 className="font-orbitron font-bold text-white text-base">Central de Downloads Imediatos do Chrome</h3>
                                        </div>
                                        <button
                                            onClick={() => setCustomDownloadModal(true)}
                                            className="text-xs px-3 py-1 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/50 text-blue-200 rounded-md transition"
                                        >
                                            + Baixar Arquivo Personalizado
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-4">
                                        Baixe conteúdos da Web diretamente para o Widons 2.0 (pasta <code>/home/user/Downloads</code>) e para a sua máquina física com um clique:
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {PRESET_DOWNLOADS.map(item => (
                                            <div key={item.name} className="p-3.5 bg-[#202124] hover:bg-[#25272a] border border-[#3c4043] rounded-xl flex items-center justify-between gap-3 transition">
                                                <div className="min-w-0">
                                                    <h5 className="font-semibold text-white text-xs truncate">{item.name}</h5>
                                                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.desc}</p>
                                                    <span className="text-[10px] text-cyan-400 font-mono">{item.size}</span>
                                                </div>
                                                <button
                                                    onClick={() => triggerDownload(item.name, item.content, item.type)}
                                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 flex-shrink-0 shadow-lg shadow-emerald-900/30"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                    Baixar
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Live Web Frame */
                            <div className="flex-grow bg-black relative">
                                {loadError ? (
                                    <div className="h-full flex flex-col items-center justify-center p-8 text-center text-white bg-[#202124]">
                                        <ChromeIconSvg className="w-16 h-16 opacity-40 mb-4" />
                                        <h3 className="text-xl font-bold text-red-400">Não foi possível carregar a página</h3>
                                        <p className="text-gray-400 text-sm mt-2 max-w-md">O site pode estar indisponível ou bloqueando exibição embutida.</p>
                                        <div className="mt-6 flex gap-3">
                                            <button onClick={reload} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs transition">
                                                Tentar Novamente
                                            </button>
                                            <button onClick={downloadCurrentPage} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs transition">
                                                Salvar como Arquivo (.html)
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <iframe
                                            ref={iframeRef}
                                            src={currentUrl}
                                            onLoad={() => setIsLoading(false)}
                                            className={`w-full h-full border-none bg-white transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                                            title="Google Chrome Web Content"
                                            sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
                                        />
                                        {/* Floating Quick-Download Page Button */}
                                        <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                                            <button
                                                onClick={downloadCurrentPage}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-full shadow-2xl flex items-center gap-1.5 transition"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                Baixar Conteúdo
                                            </button>
                                        </div>
                                    </>
                                )}

                                {isLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-[#202124]">
                                        <div className="flex flex-col items-center gap-3">
                                            <ChromeIconSvg className="w-12 h-12 animate-bounce" />
                                            <p className="text-sm text-gray-400">Carregando com Google Chrome...</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Bottom Download Shelf (Classic Google Chrome Download Bar) */}
            {showDownloadShelf && latestDownload && (
                <div className="bg-[#292a2d] border-t border-[#3c4043] px-4 py-2 flex items-center justify-between shadow-2xl z-30 animate-slide-in-bottom flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                            ✓
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-white">{latestDownload.filename}</p>
                            <p className="text-[11px] text-emerald-400">Download concluído • Salvo em /home/user/Downloads</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onOpenPath?.(`/home/user/Downloads/${latestDownload.filename}`)}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded transition"
                        >
                            Abrir
                        </button>
                        <button
                            onClick={() => onOpenPath?.('/home/user/Downloads')}
                            className="px-3 py-1 bg-[#3c4043] hover:bg-[#4d5156] text-gray-200 text-xs rounded transition"
                        >
                            Mostrar na Pasta
                        </button>
                        <button
                            onClick={() => setShowDownloadShelf(false)}
                            className="p-1 text-gray-400 hover:text-white transition"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* Custom Download Modal */}
            {customDownloadModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setCustomDownloadModal(false)}>
                    <div className="bg-[#292a2d] border border-cyan-500/40 rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="font-orbitron font-bold text-lg text-white mb-2 flex items-center gap-2">
                            <ChromeIconSvg className="w-5 h-5" />
                            Baixar Arquivo no Google Chrome
                        </h3>
                        <p className="text-xs text-gray-400 mb-4">
                            Crie ou baixe qualquer arquivo diretamente para o sistema Widons 2.0 e para o seu PC.
                        </p>

                        <form onSubmit={handleCustomDownloadSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Nome do Arquivo:</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="ex: meu_codigo.js, imagem.svg, notas.txt"
                                    value={customFileName}
                                    onChange={e => setCustomFileName(e.target.value)}
                                    className="w-full bg-[#202124] border border-[#3c4043] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-300 mb-1">Conteúdo do Arquivo / Texto:</label>
                                <textarea
                                    rows={4}
                                    placeholder="Digite o código, texto ou dados do arquivo..."
                                    value={customContent}
                                    onChange={e => setCustomContent(e.target.value)}
                                    className="w-full bg-[#202124] border border-[#3c4043] rounded-lg p-3 text-sm text-white font-mono focus:outline-none focus:border-blue-500 resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setCustomDownloadModal(false)}
                                    className="px-4 py-2 bg-[#3c4043] hover:bg-[#4d5156] text-gray-200 text-xs font-semibold rounded-lg transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    Baixar no Widons 2.0
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrowserApp;