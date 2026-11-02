import React, { useState, useEffect, useCallback } from 'react';
import * as VFS from '../../services/virtualFileSystem';

interface CodeEditProps {
    filePath?: string;
    updateVfs: () => void;
    onClose: () => void;
}

const CodeEditApp: React.FC<CodeEditProps> = ({ filePath, updateVfs, onClose }) => {
    const [currentFilePath, setCurrentFilePath] = useState(filePath || '');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('Pronto.');

    useEffect(() => {
        if (currentFilePath) {
            const fileNode = VFS.getNode(currentFilePath);
            if (fileNode && fileNode.type === 'file') {
                setContent(fileNode.content);
                setStatus(`Carregado: ${currentFilePath}`);
            } else {
                setStatus(`Erro: Não foi possível carregar o arquivo em ${currentFilePath}`);
            }
        } else {
            setStatus('Novo arquivo. Salve para criar.');
        }
    }, [currentFilePath]);

    const handleSave = useCallback(() => {
        if (!currentFilePath) {
            // This could be enhanced with a "Save As" dialog
            const newPath = prompt("Salvar como (caminho completo, ex: /home/user/Desktop/novo.txt):");
            if (newPath) {
                setCurrentFilePath(newPath);
                 VFS.createFile(newPath, content);
                 setStatus('Salvando...');
                 updateVfs();
                 setTimeout(() => setStatus(`Salvo em ${newPath}`), 500);
            }
            return;
        }
        setStatus('Salvando...');
        const success = VFS.writeFile(currentFilePath, content);
        if (success) {
            updateVfs();
            setTimeout(() => setStatus('Salvo com sucesso.'), 500);
        } else {
            setTimeout(() => setStatus('Erro: Falha ao salvar o arquivo.'), 500);
        }
    }, [currentFilePath, content, updateVfs]);

    return (
        <div className="h-full flex flex-col bg-gray-900/80 text-cyan-300 font-mono">
            <div className="flex items-center justify-between p-2 bg-black/50 border-b border-[rgba(var(--accent-color-rgb),0.5)] flex-shrink-0">
                <p className="text-sm truncate">
                    {currentFilePath ? `Editando: ${currentFilePath}` : 'Arquivo sem Título'}
                </p>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={handleSave}
                        className="px-4 py-1 bg-[var(--accent-color)] text-black text-sm font-bold rounded-md hover:brightness-110 transition-colors"
                    >
                        Salvar
                    </button>
                </div>
            </div>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-grow w-full p-4 bg-black/70 text-white font-mono border-none focus:outline-none resize-none"
                placeholder="Comece a digitar..."
            />
            <div className="p-1 bg-black/50 text-xs text-gray-400 border-t border-[rgba(var(--accent-color-rgb),0.5)] flex-shrink-0">
                {status}
            </div>
        </div>
    );
};

export default CodeEditApp;