import React, { useState, useEffect } from 'react';
import { TrashItem } from '../../types';
import * as VFS from '../../services/virtualFileSystem';

interface TrashAppProps {
    updateVfs: () => void;
    addNotification?: (title: string, message: string) => void;
}

const TrashApp: React.FC<TrashAppProps> = ({ updateVfs, addNotification }) => {
    const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    const refreshTrash = () => {
        setTrashItems(VFS.getTrashItems());
    };

    useEffect(() => {
        refreshTrash();
    }, []);

    const handleRestore = (id: string, name: string) => {
        const success = VFS.restoreTrashItem(id);
        if (success) {
            refreshTrash();
            updateVfs();
            addNotification?.('Lixeira', `"${name}" foi restaurado com sucesso.`);
        }
    };

    const handleRestoreAll = () => {
        if (trashItems.length === 0) return;
        if (confirm('Deseja restaurar todos os itens da lixeira para seus locais originais?')) {
            VFS.restoreAllTrash();
            refreshTrash();
            updateVfs();
            addNotification?.('Lixeira', 'Todos os itens foram restaurados.');
        }
    };

    const handleDeletePermanently = (id: string, name: string) => {
        if (confirm(`Tem certeza de que deseja excluir permanentemente "${name}"? Esta ação não pode ser desfeita.`)) {
            VFS.deletePermanently(id);
            refreshTrash();
            updateVfs();
            addNotification?.('Lixeira', `"${name}" foi excluído definitivamente.`);
        }
    };

    const handleEmptyTrash = () => {
        if (trashItems.length === 0) return;
        if (confirm(`Tem certeza de que deseja esvaziar a lixeira e excluir permanentemente ${trashItems.length} item(ns)?`)) {
            VFS.emptyTrash();
            refreshTrash();
            updateVfs();
            addNotification?.('Lixeira', 'A lixeira foi esvaziada.');
        }
    };

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="h-full flex flex-col bg-slate-950 text-cyan-200 font-sans selection:bg-cyan-500 selection:text-black">
            {/* Header Toolbar */}
            <div className="p-3 bg-black/60 border-b border-cyan-800/60 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-[var(--accent-color)] shadow-[0_0_10px_rgba(var(--accent-color-rgb),0.3)]">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.904a.75.75 0 00-1.5.058l.5 8.5a.75.75 0 001.5-.058l-.5-8.5zm5.482.058a.75.75 0 10-1.498-.058l-.5 8.5a.75.75 0 001.498.058l.5-8.5z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="font-orbitron font-bold text-lg text-white">Lixeira do Widons 2.0</h2>
                        <p className="text-xs text-gray-400">
                            {trashItems.length === 0 ? 'A lixeira está vazia' : `${trashItems.length} item(ns) na lixeira`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRestoreAll}
                        disabled={trashItems.length === 0}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-600/50 text-cyan-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Restaurar Todos
                    </button>
                    <button
                        onClick={handleEmptyTrash}
                        disabled={trashItems.length === 0}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md bg-red-900/50 hover:bg-red-800 border border-red-500/50 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Esvaziar Lixeira
                    </button>
                </div>
            </div>

            {/* Content List */}
            <div className="flex-grow overflow-auto p-4">
                {trashItems.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                        <div className="w-20 h-20 rounded-full bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center text-cyan-500/60 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor" className="w-10 h-10">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                        </div>
                        <h3 className="font-orbitron text-lg font-bold text-gray-300">A Lixeira está vazia</h3>
                        <p className="text-sm text-gray-500 max-w-sm mt-1">
                            Arquivos e pastas excluídos no Widons 2.0 serão movidos para cá e poderão ser restaurados a qualquer momento.
                        </p>
                    </div>
                ) : (
                    <div className="bg-black/40 rounded-lg border border-cyan-900/40 overflow-hidden shadow-xl">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-cyan-950/60 text-xs uppercase tracking-wider text-cyan-300/80 border-b border-cyan-800/40">
                                <tr>
                                    <th className="py-2.5 px-4 font-semibold">Nome</th>
                                    <th className="py-2.5 px-4 font-semibold hidden md:table-cell">Local Original</th>
                                    <th className="py-2.5 px-4 font-semibold hidden sm:table-cell">Data de Exclusão</th>
                                    <th className="py-2.5 px-4 font-semibold text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-cyan-950/50">
                                {trashItems.map((item) => {
                                    const isSelected = selectedItemId === item.id;
                                    const isDirectory = item.node.type === 'directory';

                                    return (
                                        <tr
                                            key={item.id}
                                            onClick={() => setSelectedItemId(item.id)}
                                            className={`transition-colors cursor-pointer ${
                                                isSelected ? 'bg-cyan-900/30' : 'hover:bg-cyan-950/20'
                                            }`}
                                        >
                                            <td className="py-3 px-4 flex items-center gap-2.5">
                                                <div className="w-6 h-6 flex-shrink-0 text-cyan-400">
                                                    {isDirectory ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-1.5V9a3 3 0 00-3-3h-3.379a3 3 0 01-2.121-.879L8.379 4.12A3 3 0 006.257 3.24H4.5A3 3 0 001.5 6.24v11.76a3 3 0 003 3h15z" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                            <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zM12.75 12a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V18a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V12z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="font-medium text-white truncate max-w-[180px] sm:max-w-xs">
                                                    {item.name}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-xs text-gray-400 truncate max-w-xs hidden md:table-cell">
                                                {item.originalPath}
                                            </td>
                                            <td className="py-3 px-4 text-xs text-gray-400 hidden sm:table-cell">
                                                {formatDate(item.deletedAt)}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRestore(item.id, item.name);
                                                        }}
                                                        title="Restaurar este item"
                                                        className="px-2.5 py-1 text-xs rounded bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-400/50 text-cyan-200 font-semibold transition"
                                                    >
                                                        Restaurar
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeletePermanently(item.id, item.name);
                                                        }}
                                                        title="Excluir Definitivamente"
                                                        className="px-2 py-1 text-xs rounded bg-red-950/50 hover:bg-red-800 border border-red-500/40 text-red-200 transition"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Status Footer */}
            <div className="p-2 px-4 bg-black/60 border-t border-cyan-900/40 text-xs text-gray-400 flex justify-between items-center flex-shrink-0">
                <span>Widons 2.0 Recycle Bin Engine</span>
                <span>{trashItems.length} arquivo(s) prontos para recuperação</span>
            </div>
        </div>
    );
};

export default TrashApp;
