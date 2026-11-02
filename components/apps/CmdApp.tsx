import React, { useState, useRef, useEffect } from 'react';
import * as VFS from '../../services/virtualFileSystem';

interface CmdAppProps {
    onClose?: () => void;
    onOpenApp?: (appId: string) => void;
}

const CmdApp: React.FC<CmdAppProps> = ({ onClose, onOpenApp }) => {
    const [lines, setLines] = useState<string[]>([
        'Microsoft Windows [versão 10.0.19045.3803]',
        '(c) Microsoft Corporation. Todos os direitos reservados.',
        'Widons 2.0 Command Processor. Digite "HELP" para obter ajuda.',
        ''
    ]);
    const [input, setInput] = useState('');
    const [currentPath, setCurrentPath] = useState('C:\\Users\\user');
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [lines]);

    const toVFSPath = (winPath: string) => {
        const cleaned = winPath.replace(/^C:\\Users\\user/i, '/home/user').replace(/\\/g, '/');
        return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
    };

    const toWinPath = (vfsPath: string) => {
        return vfsPath.replace(/^\/home\/user/i, 'C:\\Users\\user').replace(/\//g, '\\');
    };

    const handleCommand = (rawCmd: string) => {
        const cmdTrimmed = rawCmd.trim();
        if (!cmdTrimmed) return;

        setHistory(prev => [...prev, cmdTrimmed]);
        setHistoryIndex(-1);

        const newOutput = [...lines, `${currentPath}>${cmdTrimmed}`];
        const [cmd, ...args] = cmdTrimmed.split(' ');
        const commandLower = cmd.toLowerCase();

        switch (commandLower) {
            case 'cls':
            case 'clear':
                setLines([]);
                return;

            case 'ver':
                newOutput.push('Widons 2.0 [Versão 10.0.22631.2861]');
                break;

            case 'exit':
                onClose?.();
                return;

            case 'date':
                newOutput.push(`A data atual é: ${new Date().toLocaleDateString('pt-BR')}`);
                break;

            case 'time':
                newOutput.push(`A hora atual é: ${new Date().toLocaleTimeString('pt-BR')}`);
                break;

            case 'help':
                newOutput.push(
                    'Para obter mais informações sobre um comando específico, digite o nome do comando.',
                    'CD             Muda o diretório atual.',
                    'CLS            Limpa a tela.',
                    'DIR            Exibe uma lista de arquivos e subdiretórios em um diretório.',
                    'ECHO           Exibe mensagens na tela.',
                    'EXIT           Sai do programa CMD.EXE.',
                    'HELP           Fornece informações de ajuda para os comandos do Widons.',
                    'MKDIR / MD     Cria um diretório.',
                    'START          Inicia um aplicativo (ex: START chrome, START notepad, START paint).',
                    'TYPE           Exibe o conteúdo de um arquivo de texto.',
                    'VER            Exibe a versão do Windows.'
                );
                break;

            case 'dir': {
                const vPath = toVFSPath(currentPath);
                const node = VFS.getNode(vPath);
                if (node && node.type === 'directory') {
                    newOutput.push(
                        ` O volume na unidade C é WidonsOS`,
                        ` Pasta de ${currentPath}`,
                        ''
                    );
                    const children = Object.values(node.children);
                    for (const child of children) {
                        const isDir = child.type === 'directory';
                        const tag = isDir ? '<DIR>         ' : '              ';
                        newOutput.push(`2026-11-02  12:00    ${tag}  ${child.name}`);
                    }
                    newOutput.push(`               ${children.length} arquivo(s)`);
                } else {
                    newOutput.push('Arquivo não encontrado.');
                }
                break;
            }

            case 'cd': {
                if (!args[0]) {
                    newOutput.push(currentPath);
                } else if (args[0] === '..') {
                    const parts = currentPath.split('\\');
                    if (parts.length > 2) {
                        parts.pop();
                        setCurrentPath(parts.join('\\'));
                    }
                } else {
                    const targetSub = args[0].replace(/\\/g, '/');
                    const curV = toVFSPath(currentPath);
                    const resolved = VFS.resolvePath(curV, targetSub);
                    const node = VFS.getNode(resolved);
                    if (node && node.type === 'directory') {
                        setCurrentPath(toWinPath(resolved));
                    } else {
                        newOutput.push(`O sistema não pode encontrar o caminho especificado.`);
                    }
                }
                break;
            }

            case 'type': {
                if (!args[0]) {
                    newOutput.push('A sintaxe do comando está incorreta.');
                } else {
                    const vPath = toVFSPath(`${currentPath}\\${args[0]}`);
                    const node = VFS.getNode(vPath);
                    if (node && node.type === 'file') {
                        newOutput.push(node.content);
                    } else {
                        newOutput.push('O sistema não pode encontrar o arquivo especificado.');
                    }
                }
                break;
            }

            case 'mkdir':
            case 'md': {
                if (!args[0]) {
                    newOutput.push('A sintaxe do comando está incorreta.');
                } else {
                    const vPath = toVFSPath(`${currentPath}\\${args[0]}`);
                    VFS.createDirectory(vPath);
                    newOutput.push(`Diretório criado: ${args[0]}`);
                }
                break;
            }

            case 'echo':
                newOutput.push(args.join(' '));
                break;

            case 'start': {
                const target = (args[0] || '').toLowerCase();
                if (target === 'chrome' || target === 'browser') {
                    onOpenApp?.('browser');
                    newOutput.push('Iniciando Google Chrome...');
                } else if (target === 'notepad' || target === 'bloco') {
                    onOpenApp?.('notepad');
                    newOutput.push('Iniciando Bloco de Notas...');
                } else if (target === 'paint') {
                    onOpenApp?.('paint');
                    newOutput.push('Iniciando Paint 10...');
                } else if (target === 'calc' || target === 'calculator') {
                    onOpenApp?.('calculator');
                    newOutput.push('Iniciando Calculadora...');
                } else if (target === 'explorer') {
                    onOpenApp?.('explorer');
                    newOutput.push('Iniciando Explorador de Arquivos...');
                } else {
                    newOutput.push(`Iniciando ${target}...`);
                    onOpenApp?.(target);
                }
                break;
            }

            default:
                newOutput.push(`'${cmd}' não é reconhecido como um comando interno ou externo, um programa operável ou um arquivo em lotes.`);
                break;
        }

        newOutput.push('');
        setLines(newOutput);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleCommand(input);
            setInput('');
        } else if (e.key === 'ArrowUp') {
            if (history.length > 0) {
                const nextIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
                setHistoryIndex(nextIdx);
                setInput(history[nextIdx] || '');
            }
        } else if (e.key === 'ArrowDown') {
            if (historyIndex >= 0) {
                const nextIdx = historyIndex + 1;
                if (nextIdx < history.length) {
                    setHistoryIndex(nextIdx);
                    setInput(history[nextIdx] || '');
                } else {
                    setHistoryIndex(-1);
                    setInput('');
                }
            }
        }
    };

    return (
        <div
            className="h-full bg-black text-white font-mono text-sm p-3 overflow-y-auto cursor-text select-text"
            onClick={() => document.getElementById('cmd-input')?.focus()}
        >
            <div className="space-y-0.5">
                {lines.map((line, idx) => (
                    <div key={idx} className="whitespace-pre-wrap leading-tight">
                        {line}
                    </div>
                ))}
            </div>

            <div className="flex items-center mt-1">
                <span className="text-white mr-1 select-none">{currentPath}&gt;</span>
                <input
                    id="cmd-input"
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="flex-grow bg-transparent text-white focus:outline-none border-none font-mono"
                    autoComplete="off"
                    spellCheck={false}
                />
            </div>
            <div ref={bottomRef} />
        </div>
    );
};

export default CmdApp;
