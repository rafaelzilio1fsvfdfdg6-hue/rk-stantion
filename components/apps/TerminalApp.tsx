import React, { useState, useRef, useEffect, useCallback } from 'react';
import { generateTerminalResponse } from '../../services/geminiService';
import * as VFS from '../../services/virtualFileSystem';
import { VFSNode } from '../../types';
import { Content } from "@google/genai";

interface Line {
  type: 'input' | 'output' | 'system';
  text: string;
}

const TerminalApp: React.FC<{onClose: () => void}> = ({onClose}) => {
  const [lines, setLines] = useState<Line[]>([
    { type: 'system', text: 'Núcleo de IA RK-9 v2.0 "Neon". Digite "ajuda" para ver os comandos.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Content[]>([]);
  const [currentPath, setCurrentPath] = useState('/home/user');
  const endOfTerminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfTerminalRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleLocalCommand = (cmd: string): boolean => {
      const [command, ...args] = cmd.toLowerCase().trim().split(' ');
      
      const addSystemLine = (text: string) => setLines(prev => [...prev, {type: 'system', text}]);

      switch(command) {
        case 'limpar':
        case 'clear':
            setLines([]);
            setHistory([]);
            return true;
        case 'ajuda':
        case 'help':
            addSystemLine('Comandos disponíveis:\n- ajuda: Mostra esta mensagem\n- limpar: Limpa o terminal\n- sair: Fecha o terminal\n- ls [caminho]: Lista o conteúdo do diretório\n- cd <caminho>: Muda de diretório\n- cat <caminho>: Exibe o conteúdo do arquivo\n- mkdir <nome>: Cria um diretório\n- pwd: Mostra o diretório atual');
            return true;
        case 'sair':
        case 'exit':
            onClose();
            return true;
        case 'pwd':
            addSystemLine(currentPath);
            return true;
        case 'ls': {
            const path = args[0] ? VFS.resolvePath(currentPath, args[0]) : currentPath;
            const node = VFS.getNode(path);
            if (node?.type === 'directory') {
                const content = Object.keys(node.children).map(name => {
                    const child = node.children[name];
                    return child.type === 'directory' ? `[${name}]/` : name;
                }).join('\n');
                addSystemLine(content || 'Diretório está vazio.');
            } else {
                addSystemLine(`ls: não foi possível acessar '${path}': Arquivo ou diretório não encontrado`);
            }
            return true;
        }
        case 'cd': {
            const newPath = VFS.resolvePath(currentPath, args[0] || '/');
            const node = VFS.getNode(newPath);
            if (node && node.type === 'directory') {
                setCurrentPath(newPath);
            } else {
                addSystemLine(`cd: arquivo ou diretório não encontrado: ${args[0]}`);
            }
            return true;
        }
        case 'cat': {
            const path = VFS.resolvePath(currentPath, args[0]);
            const node = VFS.getNode(path);
            if (node?.type === 'file') {
                addSystemLine(node.content);
            } else {
                addSystemLine(`cat: ${args[0]}: Arquivo ou diretório não encontrado`);
            }
            return true;
        }
        case 'mkdir': {
            const path = VFS.resolvePath(currentPath, args[0]);
            VFS.createDirectory(path);
            return true;
        }
        default:
            return false;
      }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newLines: Line[] = [...lines, { type: 'input', text: input }];
    setLines(newLines);
    
    if (handleLocalCommand(input)) {
        setInput('');
        return;
    }
    
    setIsLoading(true);
    setInput('');

    const aiResponse = await generateTerminalResponse(history, input);
    
    setLines(prev => [...prev, { type: 'output', text: aiResponse }]);
    setHistory(prev => [...prev, {role: 'user', parts: [{text: input}]}, {role: 'model', parts: [{text: aiResponse}]}]);
    setIsLoading(false);
  };
  
  const Prompt: React.FC = () => <><span className="text-green-400">usuário@rkstation</span><span className="text-white">:</span><span className="text-blue-400">{currentPath}</span><span className="text-white">$&nbsp;</span></>;
  const AiPrompt: React.FC = () => <span style={{color: 'var(--accent-color)'}}>RK-9:&nbsp;</span>;

  return (
    <div className="bg-black/80 text-white font-mono text-sm h-full flex flex-col p-4" onClick={() => document.getElementById('terminal-input')?.focus()}>
      <div className="flex-grow overflow-y-auto pr-2">
        {lines.map((line, index) => (
          <div key={index} className="mb-2 whitespace-pre-wrap break-words">
            {line.type === 'input' && <span><Prompt />{line.text}</span>}
            {line.type === 'output' && <span><AiPrompt />{line.text}</span>}
            {line.type === 'system' && <span className="text-yellow-400">{line.text}</span>}
          </div>
        ))}
        {isLoading && <div className="text-gray-400"><AiPrompt />Pensando...</div>}
        <div ref={endOfTerminalRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex items-center mt-2">
        <Prompt />
        <input
          id="terminal-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow bg-transparent border-none focus:outline-none text-white"
          autoFocus
          disabled={isLoading}
          autoComplete="off"
        />
      </form>
    </div>
  );
};

export default TerminalApp;