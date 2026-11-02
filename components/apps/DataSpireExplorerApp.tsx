import React, { useState, useEffect, useMemo } from 'react';
import { VFSNode, VFSDirectory, ContextMenuItem } from '../../types';
import * as VFS from '../../services/virtualFileSystem';
import ContextMenu from '../ContextMenu';

interface ExplorerProps {
    onOpenPath?: (path: string) => void;
    onOpenApp?: (app: any, options?: any) => void;
    updateVfs: () => void;
    vfs?: VFSNode | null;
    filePath?: string;
    onExecuteFile?: (path: string, fileName: string) => void;
}

const WindowsFolderIcon = () => (
    <svg className="w-6 h-6 text-yellow-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-1.5V9a3 3 0 00-3-3h-3.379a3 3 0 01-2.121-.879L8.379 4.12A3 3 0 006.257 3.24H4.5A3 3 0 001.5 6.24v11.76a3 3 0 003 3h15z" />
    </svg>
);

const WindowsFileIcon: React.FC<{ name: string }> = ({ name }) => {
    const ext = name.split('.').pop()?.toLowerCase();

    if (ext === 'exe') {
        return (
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-blue-700 to-cyan-500 text-white flex items-center justify-center font-bold text-[9px] shadow-sm flex-shrink-0">
                EXE
            </div>
        );
    }
    if (ext === 'txt' || ext === 'md') {
        return (
            <svg className="w-6 h-6 text-blue-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zM9.75 14.25a.75.75 0 000 1.5H15a.75.75 0 000-1.5H9.75zM9.75 10.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" clipRule="evenodd" />
            </svg>
        );
    }
    if (['png', 'jpg', 'jpeg', 'svg', 'gif'].includes(ext || '')) {
        return (
            <svg className="w-6 h-6 text-purple-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
            </svg>
        );
    }
    if (['mp3', 'wav', 'ogg'].includes(ext || '')) {
        return (
            <svg className="w-6 h-6 text-pink-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.952 1.651a.75.75 0 01.298.599V16.5a4.5 4.5 0 11-3-4.243V5.592l-9 2.25v10.658a4.5 4.5 0 11-3-4.243V6.75a.75.75 0 01.57-.73l12-3a.75.75 0 011.132.631z" />
            </svg>
        );
    }
    return (
        <svg className="w-6 h-6 text-gray-400 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875z" clipRule="evenodd" />
        </svg>
    );
};

const DataSpireExplorerApp: React.FC<ExplorerProps> = ({ onOpenPath, onOpenApp, updateVfs, filePath, onExecuteFile }) => {
    const [currentPath, setCurrentPath] = useState(filePath || '/home/user/Desktop');
    const [history, setHistory] = useState<string[]>([filePath || '/home/user/Desktop']);
    const [historyIdx, setHistoryIdx] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItemName, setSelectedItemName] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'icons' | 'details'>('details');
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; items: ContextMenuItem[] } | null>(null);

    // Make sure basic Windows folders exist
    useEffect(() => {
        ['/home/user/Desktop', '/home/user/Downloads', '/home/user/Documents', '/home/user/Pictures', '/home/user/Music', '/home/user/Videos'].forEach(p => {
            if (!VFS.getNode(p)) VFS.createDirectory(p);
        });
    }, []);

    useEffect(() => {
        if (filePath && VFS.getNode(filePath)) {
            setCurrentPath(filePath);
        }
    }, [filePath]);

    const navigateTo = (path: string) => {
        const node = VFS.getNode(path);
        if (node && node.type === 'directory') {
            setCurrentPath(path);
            const newHistory = history.slice(0, historyIdx + 1);
            newHistory.push(path);
            setHistory(newHistory);
            setHistoryIdx(newHistory.length - 1);
            setSelectedItemName(null);
        }
    };

    const goBack = () => {
        if (historyIdx > 0) {
            setHistoryIdx(historyIdx - 1);
            setCurrentPath(history[historyIdx - 1]);
            setSelectedItemName(null);
        }
    };

    const goForward = () => {
        if (historyIdx < history.length - 1) {
            setHistoryIdx(historyIdx + 1);
            setCurrentPath(history[historyIdx + 1]);
            setSelectedItemName(null);
        }
    };

    const goUp = () => {
        if (currentPath === '/') return;
        const parent = currentPath.substring(0, currentPath.lastIndexOf('/')) || '/';
        navigateTo(parent);
    };

    const currentNode = VFS.getNode(currentPath);
    const allItems: VFSNode[] = (currentNode && currentNode.type === 'directory')
        ? Object.values((currentNode as VFSDirectory).children)
        : [];

    const items = useMemo(() => {
        if (!searchQuery) return allItems;
        return allItems.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [allItems, searchQuery]);

    const handleItemDoubleClick = (item: VFSNode) => {
        const fullPath = `${currentPath === '/' ? '' : currentPath}/${item.name}`;
        if (item.type === 'directory') {
            navigateTo(fullPath);
            return;
        }

        // Executable application (e.g. installed from browser or real executable)
        const ext = item.name.split('.').pop()?.toLowerCase();
        if (ext === 'exe') {
            if (onExecuteFile) {
                onExecuteFile(fullPath, item.name);
            } else if (onOpenPath) {
                onOpenPath(fullPath);
            }
            return;
        }

        if (onOpenPath) {
            onOpenPath(fullPath);
        }
    };

    const handleContextMenu = (e: React.MouseEvent, itemPath?: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (itemPath) {
            const node = VFS.getNode(itemPath);
            const isExe = itemPath.endsWith('.exe');

            const menuItems: ContextMenuItem[] = [
                {
                    label: isExe ? '⚡ Executar como Administrador' : 'Abrir',
                    action: () => { if (node) handleItemDoubleClick(node); }
                },
                {
                    label: 'Mover para a Lixeira',
                    action: () => {
                        VFS.moveToTrash(itemPath);
                        updateVfs();
                    },
                    separator: true
                },
                {
                    label: 'Renomear',
                    action: () => {
                        const newName = prompt('Novo nome:', node?.name);
                        if (newName && newName.trim()) {
                            VFS.renameNode(itemPath, newName.trim());
                            updateVfs();
                        }
                    }
                }
            ];
            setContextMenu({ x: e.clientX, y: e.clientY, items: menuItems });
        } else {
            const menuItems: ContextMenuItem[] = [
                {
                    label: 'Nova Pasta',
                    action: () => {
                        VFS.createDirectory(`${currentPath}/Nova Pasta`);
                        updateVfs();
                    }
                },
                {
                    label: 'Novo Documento de Texto',
                    action: () => {
                        VFS.createFile(`${currentPath}/Novo Documento.txt`, '');
                        updateVfs();
                    }
                },
                {
                    label: 'Atualizar',
                    action: () => { updateVfs(); },
                    separator: true
                }
            ];
            setContextMenu({ x: e.clientX, y: e.clientY, items: menuItems });
        }
    };

    const toWindowsPathDisplay = (path: string) => {
        if (path.startsWith('/home/user/Desktop')) return 'Este Computador > Área de Trabalho';
        if (path.startsWith('/home/user/Downloads')) return 'Este Computador > Downloads';
        if (path.startsWith('/home/user/Documents')) return 'Este Computador > Documentos';
        if (path.startsWith('/home/user/Pictures')) return 'Este Computador > Imagens';
        if (path.startsWith('/home/user/Music')) return 'Este Computador > Músicas';
        if (path.startsWith('/home/user/Videos')) return 'Este Computador > Vídeos';
        return `Este Computador > Disco Local (C:) > ${path.replace(/^\//, '').replace(/\//g, ' > ')}`;
    };

    return (
        <div className="h-full flex flex-col bg-[#f0f0f0] text-gray-800 font-sans select-none" onClick={() => setContextMenu(null)}>
            {/* Windows 10 Ribbon Menu */}
            <div className="bg-[#f5f6f7] border-b border-[#dadada] px-3 py-1 flex items-center justify-between text-xs text-gray-700">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => { VFS.createDirectory(`${currentPath}/Nova Pasta`); updateVfs(); }}
                        className="px-2.5 py-1 rounded hover:bg-gray-200 transition flex items-center gap-1 font-medium"
                    >
                        📁 Nova Pasta
                    </button>
                    <button
                        onClick={() => { VFS.createFile(`${currentPath}/Novo Documento.txt`, ''); updateVfs(); }}
                        className="px-2.5 py-1 rounded hover:bg-gray-200 transition flex items-center gap-1"
                    >
                        📄 Novo Arquivo
                    </button>
                    <div className="w-px h-4 bg-gray-300 mx-1" />
                    <button
                        onClick={() => setViewMode(v => v === 'details' ? 'icons' : 'details')}
                        className="px-2.5 py-1 rounded hover:bg-gray-200 transition"
                    >
                        {viewMode === 'details' ? 'Exibir: Ícones Grandes' : 'Exibir: Detalhes'}
                    </button>
                </div>
                <div className="text-[11px] text-gray-500 font-medium">
                    Explorador de Arquivos - Widons 2.0
                </div>
            </div>

            {/* Address Bar & Navigation */}
            <div className="bg-[#ffffff] border-b border-[#e5e5e5] p-1.5 px-3 flex items-center gap-2 text-xs">
                <button onClick={goBack} disabled={historyIdx <= 0} title="Voltar" className="p-1 rounded hover:bg-gray-200 disabled:opacity-30">
                    ←
                </button>
                <button onClick={goForward} disabled={historyIdx >= history.length - 1} title="Avançar" className="p-1 rounded hover:bg-gray-200 disabled:opacity-30">
                    →
                </button>
                <button onClick={goUp} disabled={currentPath === '/'} title="Pasta Acima" className="p-1 rounded hover:bg-gray-200 disabled:opacity-30">
                    ↑
                </button>

                {/* Breadcrumbs Path */}
                <div className="flex-grow flex items-center bg-[#fdfdfd] border border-[#d9d9d9] hover:border-[#b5b5b5] focus-within:border-blue-500 rounded px-3 py-1 shadow-inner">
                    <span className="text-gray-400 mr-1.5">💻</span>
                    <span className="text-gray-800 font-medium truncate flex-grow">
                        {toWindowsPathDisplay(currentPath)}
                    </span>
                    <button onClick={updateVfs} title="Atualizar" className="text-gray-400 hover:text-gray-700 ml-2">
                        ⟳
                    </button>
                </div>

                {/* Search */}
                <div className="w-48 bg-[#fdfdfd] border border-[#d9d9d9] focus-within:border-blue-500 rounded px-2.5 py-1 flex items-center shadow-inner">
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-none text-xs focus:outline-none"
                    />
                    <span className="text-gray-400">🔍</span>
                </div>
            </div>

            {/* Main Body: Sidebar Categories & File List */}
            <div className="flex-grow flex overflow-hidden bg-white">
                {/* Windows 10 Left Navigation Pane */}
                <aside className="w-56 bg-[#f8f9fa] border-r border-[#e5e5e5] p-2 overflow-y-auto text-xs text-gray-700 flex flex-col gap-4 select-none">
                    {/* Acesso rápido */}
                    <div>
                        <div className="px-2 py-1 font-bold text-gray-500 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                            📌 Acesso Rápido
                        </div>
                        <div className="mt-1 space-y-0.5">
                            {[
                                { name: 'Área de Trabalho', path: '/home/user/Desktop', icon: '🖥️' },
                                { name: 'Downloads', path: '/home/user/Downloads', icon: '⬇️' },
                                { name: 'Documentos', path: '/home/user/Documents', icon: '📁' },
                                { name: 'Imagens', path: '/home/user/Pictures', icon: '🖼️' },
                                { name: 'Músicas', path: '/home/user/Music', icon: '🎵' },
                                { name: 'Vídeos', path: '/home/user/Videos', icon: '🎬' },
                            ].map(item => (
                                <button
                                    key={item.path}
                                    onClick={() => navigateTo(item.path)}
                                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left transition ${
                                        currentPath === item.path ? 'bg-[#cde4f7] text-[#004275] font-semibold' : 'hover:bg-[#eaeaea]'
                                    }`}
                                >
                                    <span>{item.icon}</span>
                                    <span className="truncate">{item.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Este Computador */}
                    <div>
                        <div className="px-2 py-1 font-bold text-gray-500 uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                            💻 Este Computador
                        </div>
                        <div className="mt-1 space-y-0.5">
                            <button
                                onClick={() => navigateTo('/')}
                                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left transition ${
                                    currentPath === '/' ? 'bg-[#cde4f7] text-[#004275] font-semibold' : 'hover:bg-[#eaeaea]'
                                }`}
                            >
                                <span>💽</span>
                                <span className="truncate">Disco Local (C:)</span>
                            </button>
                            <button
                                onClick={() => navigateTo('/home/user')}
                                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left transition ${
                                    currentPath === '/home/user' ? 'bg-[#cde4f7] text-[#004275] font-semibold' : 'hover:bg-[#eaeaea]'
                                }`}
                            >
                                <span>👤</span>
                                <span className="truncate">Usuário (user)</span>
                            </button>
                        </div>
                    </div>

                    {/* Lixeira */}
                    <div>
                        <div className="px-2 py-1 font-bold text-gray-500 uppercase text-[10px] tracking-wider">
                            🗑️ Lixeira
                        </div>
                        <button
                            onClick={() => onOpenApp?.({ id: 'trash', name: 'Lixeira' })}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left hover:bg-[#eaeaea] transition text-gray-700"
                        >
                            <span>🗑️</span>
                            <span>Abrir Lixeira</span>
                        </button>
                    </div>
                </aside>

                {/* Right Content Area */}
                <main
                    className="flex-grow p-4 overflow-y-auto bg-white"
                    onContextMenu={e => handleContextMenu(e)}
                >
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                            <span className="text-3xl mb-2">📁</span>
                            Esta pasta está vazia.
                        </div>
                    ) : viewMode === 'details' ? (
                        /* Windows Details View */
                        <table className="w-full text-left text-xs text-gray-700">
                            <thead>
                                <tr className="border-b border-gray-200 text-gray-500 select-none">
                                    <th className="pb-2 font-semibold">Nome</th>
                                    <th className="pb-2 font-semibold hidden sm:table-cell">Tipo</th>
                                    <th className="pb-2 font-semibold text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.map(item => {
                                    const isDir = item.type === 'directory';
                                    const isExe = item.name.endsWith('.exe');
                                    const isSelected = selectedItemName === item.name;

                                    return (
                                        <tr
                                            key={item.name}
                                            onClick={() => setSelectedItemName(item.name)}
                                            onDoubleClick={() => handleItemDoubleClick(item)}
                                            onContextMenu={e => handleContextMenu(e, `${currentPath === '/' ? '' : currentPath}/${item.name}`)}
                                            className={`cursor-pointer transition ${
                                                isSelected ? 'bg-[#cde4f7]' : 'hover:bg-[#e5f3ff]'
                                            }`}
                                        >
                                            <td className="py-2 flex items-center gap-2">
                                                {isDir ? <WindowsFolderIcon /> : <WindowsFileIcon name={item.name} />}
                                                <span className={`font-medium truncate ${isExe ? 'text-blue-700 font-bold' : 'text-gray-900'}`}>
                                                    {item.name}
                                                </span>
                                            </td>
                                            <td className="py-2 text-gray-500 hidden sm:table-cell">
                                                {isDir ? 'Pasta de arquivos' : isExe ? 'Aplicativo Executável Widons (.exe)' : 'Arquivo'}
                                            </td>
                                            <td className="py-2 text-right">
                                                {isExe ? (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleItemDoubleClick(item);
                                                        }}
                                                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-[11px] shadow-sm transition"
                                                    >
                                                        ⚡ Executar
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleItemDoubleClick(item);
                                                        }}
                                                        className="px-2 py-0.5 text-gray-600 hover:bg-gray-200 rounded"
                                                    >
                                                        Abrir
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        /* Large Icons View */
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                            {items.map(item => {
                                const isDir = item.type === 'directory';
                                const isExe = item.name.endsWith('.exe');
                                const isSelected = selectedItemName === item.name;

                                return (
                                    <div
                                        key={item.name}
                                        onClick={() => setSelectedItemName(item.name)}
                                        onDoubleClick={() => handleItemDoubleClick(item)}
                                        onContextMenu={e => handleContextMenu(e, `${currentPath === '/' ? '' : currentPath}/${item.name}`)}
                                        className={`flex flex-col items-center justify-center p-3 rounded border text-center cursor-pointer transition ${
                                            isSelected ? 'bg-[#cde4f7] border-[#7da2ce]' : 'border-transparent hover:bg-[#e5f3ff] hover:border-[#d9e8fb]'
                                        }`}
                                    >
                                        <div className="w-12 h-12 flex items-center justify-center mb-1">
                                            {isDir ? (
                                                <svg className="w-10 h-10 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-1.5V9a3 3 0 00-3-3h-3.379a3 3 0 01-2.121-.879L8.379 4.12A3 3 0 006.257 3.24H4.5A3 3 0 001.5 6.24v11.76a3 3 0 003 3h15z" />
                                                </svg>
                                            ) : (
                                                <WindowsFileIcon name={item.name} />
                                            )}
                                        </div>
                                        <span className={`text-xs w-full truncate ${isExe ? 'text-blue-700 font-bold' : 'text-gray-800'}`}>
                                            {item.name}
                                        </span>
                                        {isExe && (
                                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-bold mt-1">
                                                Executável
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>

            {/* Status Bar */}
            <div className="bg-[#f0f0f0] border-t border-[#dadada] px-3 py-1 text-[11px] text-gray-600 flex justify-between items-center">
                <span>{items.length} item(ns)</span>
                <span>{selectedItemName ? `1 item selecionado: ${selectedItemName}` : 'Pronto'}</span>
            </div>

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    items={contextMenu.items}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    );
};

export default DataSpireExplorerApp;
