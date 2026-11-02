import React, { useState, useEffect, useCallback } from 'react';
import * as VFS from '../../services/virtualFileSystem';

interface NotepadAppProps {
    filePath?: string;
    updateVfs?: () => void;
    onClose?: () => void;
}

const NotepadApp: React.FC<NotepadAppProps> = ({ filePath, updateVfs }) => {
    const [currentPath, setCurrentPath] = useState(filePath || '');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('Pronto');
    const [fontSize, setFontSize] = useState(14);
    const [wordWrap, setWordWrap] = useState(true);

    useEffect(() => {
        if (currentPath) {
            const node = VFS.getNode(currentPath);
            if (node && node.type === 'file') {
                setContent(node.content);
                setStatus(`Arquivo aberto: ${currentPath}`);
            }
        }
    }, [currentPath]);

    const handleSave = useCallback(() => {
        let path = currentPath;
        if (!path) {
            const name = prompt('Salvar como (ex: notas.txt):', 'Sem título.txt');
            if (!name) return;
            path = `/home/user/Documents/${name.trim()}`;
            setCurrentPath(path);
            VFS.createFile(path, content);
        } else {
            VFS.writeFile(path, content);
        }
        updateVfs?.();
        setStatus(`Salvo com sucesso em ${path} às ${new Date().toLocaleTimeString('pt-BR')}`);
    }, [currentPath, content, updateVfs]);

    const handleNew = () => {
        if (content && !confirm('Criar novo documento? Alterações não salvas serão perdidas.')) return;
        setCurrentPath('');
        setContent('');
        setStatus('Novo documento');
    };

    const linesCount = content.split('\n').length;
    const charsCount = content.length;

    return (
        <div className="h-full flex flex-col bg-white text-gray-900 font-sans select-none">
            {/* Windows 10 Notepad Menu Bar */}
            <div className="bg-[#f0f0f0] border-b border-[#dadada] px-2 py-1 flex items-center justify-between text-xs text-gray-700">
                <div className="flex items-center gap-1">
                    <button onClick={handleNew} className="px-2 py-1 rounded hover:bg-gray-200 transition">Novo</button>
                    <button onClick={handleSave} className="px-2 py-1 rounded hover:bg-gray-200 font-semibold text-blue-700 transition">Salvar (Ctrl+S)</button>
                    <div className="w-px h-4 bg-gray-300 mx-1" />
                    <button onClick={() => setWordWrap(w => !w)} className={`px-2 py-1 rounded transition ${wordWrap ? 'bg-gray-300 font-medium' : 'hover:bg-gray-200'}`}>Quebra de linha</button>
                    <button onClick={() => setFontSize(s => Math.min(28, s + 2))} className="px-2 py-1 rounded hover:bg-gray-200">A+</button>
                    <button onClick={() => setFontSize(s => Math.max(10, s - 2))} className="px-2 py-1 rounded hover:bg-gray-200">A-</button>
                </div>
                <div className="text-gray-500 truncate max-w-xs px-2">
                    {currentPath ? currentPath.split('/').pop() : 'Sem título - Bloco de Notas'}
                </div>
            </div>

            {/* Text Editor Canvas */}
            <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={e => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                        e.preventDefault();
                        handleSave();
                    }
                }}
                placeholder="Digite seu texto aqui..."
                style={{ fontSize: `${fontSize}px` }}
                className={`flex-grow p-4 bg-white text-gray-900 font-mono border-none focus:outline-none resize-none ${
                    wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre overflow-x-auto'
                }`}
            />

            {/* Status Bar */}
            <div className="bg-[#f0f0f0] border-t border-[#dadada] px-3 py-1 flex justify-between items-center text-[11px] text-gray-600">
                <span>{status}</span>
                <div className="flex items-center gap-4">
                    <span>Linhas: {linesCount} | Caracteres: {charsCount}</span>
                    <span>UTF-8</span>
                    <span>Windows (CRLF)</span>
                </div>
            </div>
        </div>
    );
};

export default NotepadApp;
