import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { AppDefinition, WindowInstance, ContextMenuItem, VFSNode, NotificationItem, TabInstance } from './types';
import { ALL_APPS, getAppById, DeleteIcon } from './constants';
import * as VFS from './services/virtualFileSystem';
import Desktop from './components/Desktop';
import Window from './components/Window';
import ContextMenu from './components/ContextMenu';
import Taskbar from './components/Taskbar';
import StartMenu from './components/StartMenu';
import Notifications from './components/Notifications';
import NexusCommand from './components/NexusCommand';

const generateTabId = () => `tab_${Date.now()}_${Math.random()}`;

const DraggableTabPreview: React.FC<{ tab: TabInstance; position: { x: number; y: number } }> = ({ tab, position }) => {
    return (
        <div
            className="fixed pointer-events-none z-[9999] px-4 py-2 bg-gray-800/80 backdrop-blur-md border border-[var(--accent-color)] rounded-md text-white text-sm shadow-lg"
            style={{
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -50%)',
            }}
        >
            {tab.app.name}
        </div>
    );
};

// Generic Dynamic Program Runner for custom downloaded .exe files
const DynamicExeRunner: React.FC<{ fileName: string; filePath: string }> = ({ fileName, filePath }) => {
    const [logs, setLogs] = useState<string[]>([
        `[SISTEMA] Carregando cabeçalho PE de ${fileName}...`,
        `[SISTEMA] Verificando assinaturas de segurança Widons 2.0... OK`,
        `[SISTEMA] Alocando memória virtual e inicializando threads... OK`,
        `[APP] ${fileName} iniciado com sucesso em modo nativo!`,
    ]);
    const [counter, setCounter] = useState(0);

    const fileNode = VFS.getNode(filePath);

    return (
        <div className="h-full flex flex-col bg-[#12161f] text-gray-200 p-4 font-sans select-none">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-700">
                <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-md">
                    EXE
                </div>
                <div>
                    <h3 className="font-bold text-white text-base">{fileName}</h3>
                    <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        Executando em tempo real no Widons 2.0
                    </p>
                </div>
            </div>

            <div className="my-4 p-4 bg-[#1a212d] rounded-xl border border-gray-700/60 shadow-inner flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-400">Origem: <code>{filePath}</code></p>
                    <p className="text-xs text-gray-400 mt-0.5">Ciclos de CPU: <span className="text-cyan-400 font-mono">{counter}</span></p>
                </div>
                <button
                    onClick={() => {
                        setCounter(c => c + 1);
                        setLogs(prev => [...prev, `[USER_EVENT] Ação do usuário processada às ${new Date().toLocaleTimeString()} (Ciclo ${counter + 1})`]);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow transition"
                >
                    Executar Comando do App
                </button>
            </div>

            {fileNode && fileNode.type === 'file' && fileNode.content && (
                <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-400 mb-1">Conteúdo do Pacote / Código:</p>
                    <pre className="p-3 bg-black/60 rounded-lg border border-gray-800 text-xs text-cyan-300 font-mono overflow-auto max-h-36">
                        {fileNode.content}
                    </pre>
                </div>
            )}

            <div className="flex-grow flex flex-col min-h-0">
                <p className="text-xs font-semibold text-gray-400 mb-1">Console de Execução:</p>
                <div className="flex-grow bg-black/80 rounded-lg p-3 font-mono text-xs text-emerald-400 overflow-y-auto space-y-1 border border-gray-800">
                    {logs.map((log, i) => (
                        <div key={i}>{log}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const [closingWindows, setClosingWindows] = useState<number[]>([]);
  const [nextId, setNextId] = useState(1);
  const [activeWindowId, setActiveWindowId] = useState<number | null>(null);
  const [vfs, setVfs] = useState<VFSNode | null>(null);

  const [installedApps, setInstalledApps] = useState<AppDefinition[]>(() => {
    return ALL_APPS;
  });

  const [theme, setTheme] = useState({ accentColor: '#00f0ff', wallpaper: '' });
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, items: ContextMenuItem[] } | null>(null);
  const [isStartMenuOpen, setStartMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [nextNotifId, setNextNotifId] = useState(1);
  const [isCommandBarOpen, setCommandBarOpen] = useState(false);

  // Tab Dragging State
  const [draggedTab, setDraggedTab] = useState<{ sourceWindowId: number; tab: TabInstance; } | null>(null);
  const [draggedTabPosition, setDraggedTabPosition] = useState<{ x: number, y: number } | null>(null);
  const [dropTargetWindowId, setDropTargetWindowId] = useState<number | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const addNotification = useCallback((title: string, message: string) => {
    const newNotif: NotificationItem = { id: nextNotifId, title, message };
    setNextNotifId(p => p + 1);
    setNotifications(p => [newNotif, ...p]);
    const timer = setTimeout(() => { setNotifications(currentNotifs => currentNotifs.filter(n => n.id !== newNotif.id)); }, 5000);
    return () => clearTimeout(timer);
  }, [nextNotifId]);

  // Initial startup: Immediate boot & hardware plug-and-play auto detection
  useEffect(() => {
    setVfs(VFS.initialize());
    const savedTheme = localStorage.getItem('widons_theme') || localStorage.getItem('rkstation_theme');
    if (savedTheme) { try { setTheme(JSON.parse(savedTheme)); } catch(e) { } }

    // Automatic Device Detection
    const t1 = setTimeout(() => {
        addNotification(
            'Hardware Plug & Play',
            '✓ Adaptador Wi-Fi 6E AX210 e Adaptador Bluetooth 5.3 reconhecidos e configurados automaticamente!'
        );
    }, 600);

    const t2 = setTimeout(() => {
        addNotification(
            'Conexão Wi-Fi',
            'Conectado a "Wi-Fi_Casa_5GHz" (2402 Mbps, Sinal: 98% Excelente)'
        );
    }, 1400);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [addNotification]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setCommandBarOpen(p => !p); }
      if (e.key === 'Escape') { setCommandBarOpen(false); setStartMenuOpen(false); setContextMenu(null); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', theme.accentColor);
    const rgb = parseInt(theme.accentColor.slice(1,3), 16) + ',' + parseInt(theme.accentColor.slice(3,5), 16) + ',' + parseInt(theme.accentColor.slice(5,7), 16);
    document.documentElement.style.setProperty('--accent-color-rgb', rgb);
    localStorage.setItem('widons_theme', JSON.stringify(theme));
  }, [theme]);

  const updateVfs = () => setVfs(VFS.getFileSystem());

  const focusWindow = useCallback((id: number) => {
    const window = windows.find(w => w.id === id);
    if (!window) return;
    if (window.isMinimized) toggleMinimize(id);
    setActiveWindowId(id);
    setWindows(prev => [...prev.filter(w => w.id !== id), window]);
    setStartMenuOpen(false);
    setCommandBarOpen(false);
  }, [windows]);

  const openApp = useCallback((app: AppDefinition, options?: { filePath?: string, windowId?: number }) => {
    setStartMenuOpen(false);
    setCommandBarOpen(false);
    
    // Handle single-instance apps
    if (app.allowMultipleInstances === false) {
      const existingWindow = windows.find(w => w.tabs.some(t => t.app.id === app.id));
      if(existingWindow) {
        focusWindow(existingWindow.id);
        const tab = existingWindow.tabs.find(t => t.app.id === app.id);
        if(tab) setActiveTab(existingWindow.id, tab.id);
        return;
      }
    }
    
    const newTab: TabInstance = { id: generateTabId(), app, filePath: options?.filePath, };
    
    // Add to an existing window if conditions are met
    const activeWindow = windows.find(w => w.id === activeWindowId);
    if (activeWindow && !activeWindow.isMinimized && (app.allowMultipleInstances || activeWindow.tabs[0].app.id === app.id)) {
        setWindows(prev => prev.map(w => w.id === activeWindowId ? { ...w, tabs: [...w.tabs, newTab], activeTabId: newTab.id } : w));
        focusWindow(activeWindowId);
        return;
    }

    // Create a new window
    const initialSize = { width: 840, height: 600 };
    const initialPos = { x: Math.max(20, (window.innerWidth - initialSize.width) / 2 + (windows.length * 20)), y: Math.max(20, (window.innerHeight - initialSize.height) / 2 + (windows.length * 20)) };
    const newWindow: WindowInstance = {
      id: nextId,
      tabs: [newTab],
      activeTabId: newTab.id,
      position: initialPos,
      size: initialSize,
      isMinimized: false, isMaximized: false,
      lastPosition: initialPos, lastSize: initialSize,
    };
    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(nextId);
    setNextId(prev => prev + 1);
  }, [nextId, windows, activeWindowId, focusWindow]);

  // Real Executable Program Runner - "o que instalar pelo navegado vai funcionar de verdade e ate executar"
  const executeProgram = useCallback((filePath: string, fileName: string) => {
    addNotification('Widons 2.0', `Executando ${fileName}...`);
    const lowerName = fileName.toLowerCase();

    // Map known executables to native apps
    if (lowerName.includes('chrome') || lowerName.includes('browser')) {
        const app = ALL_APPS.find(a => a.id === 'browser');
        if (app) { openApp(app); return; }
    }
    if (lowerName.includes('notepad') || lowerName.includes('bloco') || lowerName.includes('notas')) {
        const app = ALL_APPS.find(a => a.id === 'notepad');
        if (app) { openApp(app); return; }
    }
    if (lowerName.includes('paint') || lowerName.includes('desenho')) {
        const app = ALL_APPS.find(a => a.id === 'paint');
        if (app) { openApp(app); return; }
    }
    if (lowerName.includes('media') || lowerName.includes('player') || lowerName.includes('musica')) {
        const app = ALL_APPS.find(a => a.id === 'mediaplayer');
        if (app) { openApp(app); return; }
    }
    if (lowerName.includes('calc')) {
        const app = ALL_APPS.find(a => a.id === 'calculator');
        if (app) { openApp(app); return; }
    }
    if (lowerName.includes('cmd') || lowerName.includes('terminal')) {
        const app = ALL_APPS.find(a => a.id === 'terminal');
        if (app) { openApp(app); return; }
    }
    if (lowerName.includes('device') || lowerName.includes('wifi') || lowerName.includes('bluetooth')) {
        const app = ALL_APPS.find(a => a.id === 'devices');
        if (app) { openApp(app); return; }
    }

    // Dynamic execution of custom program!
    const dynamicApp: AppDefinition = {
        id: `custom_exe_${Date.now()}`,
        name: fileName.replace(/\.exe$/i, ''),
        icon: (
            <div className="w-full h-full rounded bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center">
                EXE
            </div>
        ),
        component: () => <DynamicExeRunner fileName={fileName} filePath={filePath} />,
        category: 'Utilities',
        allowMultipleInstances: true,
    };

    openApp(dynamicApp);
  }, [openApp, addNotification]);

  const openPath = useCallback((path: string) => {
    // Shortcuts
    if (path === '/browser' || path === 'browser') {
        const a = ALL_APPS.find(x => x.id === 'browser');
        if (a) openApp(a);
        return;
    }
    if (path === '/devices' || path === 'devices') {
        const a = ALL_APPS.find(x => x.id === 'devices');
        if (a) openApp(a);
        return;
    }
    if (path === '/trash' || path === 'trash') {
        const a = ALL_APPS.find(x => x.id === 'trash');
        if (a) openApp(a);
        return;
    }

    const node = VFS.getNode(path);
    if (!node) {
      addNotification("Erro", `Caminho não encontrado: ${path}`);
      return;
    }
    if (node.type === 'directory') {
      const explorerApp = ALL_APPS.find(app => app.id === 'explorer');
      if (explorerApp) openApp(explorerApp, { filePath: path });
      return;
    }

    const extension = path.split('.').pop()?.toLowerCase();

    // Check if executable
    if (extension === 'exe') {
      executeProgram(path, node.name);
      return;
    }

    const appToOpen = ALL_APPS.find(app => app.opensFileTypes?.includes(`.${extension}`));
    if (appToOpen) {
      openApp(appToOpen, { filePath: path });
    } else {
      const notepad = ALL_APPS.find(a => a.id === 'notepad');
      if (notepad) openApp(notepad, { filePath: path });
      else addNotification("Aviso", `Abrindo arquivo ".${extension}".`);
    }
  }, [openApp, executeProgram, addNotification]);
  
  const closeWindow = useCallback((id: number) => {
    setClosingWindows(prev => [...prev, id]);
    setTimeout(() => {
      setWindows(prevWindows => {
        const newWindows = prevWindows.filter(w => w.id !== id);
        if (activeWindowId === id) {
          setActiveWindowId(newWindows.length > 0 ? newWindows[newWindows.length - 1].id : null);
        }
        return newWindows;
      });
      setClosingWindows(prev => prev.filter(closingId => closingId !== id));
    }, 200);
  }, [activeWindowId]);

  const closeTab = useCallback((windowId: number, tabId: string) => {
    const window = windows.find(w => w.id === windowId);
    if (!window) return;
    const newTabs = window.tabs.filter(t => t.id !== tabId);
    if (newTabs.length === 0) {
      closeWindow(windowId);
    } else {
      setWindows(prev => prev.map(w => {
        if (w.id === windowId) {
          const newActiveTabId = w.activeTabId === tabId ? newTabs[newTabs.length - 1].id : w.activeTabId;
          return { ...w, tabs: newTabs, activeTabId: newActiveTabId };
        }
        return w;
      }));
    }
  }, [windows, closeWindow]);

  const setActiveTab = useCallback((windowId: number, tabId: string) => {
    setWindows(prev => prev.map(w => w.id === windowId ? { ...w, activeTabId: tabId } : w));
    focusWindow(windowId);
  }, [focusWindow]);

  const updateWindow = useCallback((id: number, updates: Partial<WindowInstance>) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  }, []);

  const toggleMaximize = useCallback((id: number) => {
    setWindows(prevWindows => prevWindows.map(w => {
      if (w.id === id) {
        if (w.isMaximized) return { ...w, isMaximized: false, isMinimized: false, position: w.lastPosition, size: w.lastSize };
        const taskbarHeight = 52;
        const newSize = { width: window.innerWidth, height: window.innerHeight - taskbarHeight };
        return { ...w, isMaximized: true, isMinimized: false, lastPosition: w.position, lastSize: w.size, position: { x: 0, y: 0 }, size: newSize };
      }
      return w;
    }));
    focusWindow(id);
  }, [focusWindow]);

  const toggleMinimize = useCallback((id: number) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        if (w.isMinimized) { if (activeWindowId === id) setActiveWindowId(null); return { ...w, isMinimized: false }; }
        else {
          if (activeWindowId === id) {
            const otherWindows = windows.filter(win => win.id !== id && !win.isMinimized);
            setActiveWindowId(otherWindows.length > 0 ? otherWindows[otherWindows.length - 1].id : null);
          }
          return { ...w, isMinimized: true };
        }
      }
      return w;
    }));
  }, [activeWindowId, windows]);

  const handleTabDragStart = useCallback((sourceWindowId: number, tab: TabInstance, e: React.MouseEvent) => {
    setDraggedTab({ sourceWindowId, tab });
    dragOffsetRef.current = { x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY };
  }, []);

  // Global mouse move and up for tab dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedTab) {
        setDraggedTabPosition({ x: e.clientX, y: e.clientY });
      }
    };
    const handleMouseUp = (e: MouseEvent) => {
      if (draggedTab) {
        setWindows(currentWindows => {
          let newWindows = [...currentWindows];
          const sourceWindow = newWindows.find(w => w.id === draggedTab.sourceWindowId)!;
          const remainingTabs = sourceWindow.tabs.filter(t => t.id !== draggedTab.tab.id);

          // Update source window
          if (remainingTabs.length > 0) {
            newWindows = newWindows.map(w => w.id === sourceWindow.id ? { ...w, tabs: remainingTabs, activeTabId: remainingTabs[0].id } : w);
          } else {
            newWindows = newWindows.filter(w => w.id !== sourceWindow.id);
          }

          // Handle drop
          if (dropTargetWindowId && dropTargetWindowId !== sourceWindow.id) {
            newWindows = newWindows.map(w => w.id === dropTargetWindowId ? { ...w, tabs: [...w.tabs, draggedTab.tab], activeTabId: draggedTab.tab.id } : w);
            setActiveWindowId(dropTargetWindowId);
          } else {
            const taskbarHeight = 52;
            const newPos = { x: e.clientX - 400, y: Math.min(e.clientY - 20, window.innerHeight - 600 - taskbarHeight) };
            const newWindow: WindowInstance = {
              id: nextId, tabs: [draggedTab.tab], activeTabId: draggedTab.tab.id,
              position: newPos, size: { width: 800, height: 600 },
              isMinimized: false, isMaximized: false,
              lastPosition: newPos, lastSize: { width: 800, height: 600 },
            };
            newWindows.push(newWindow);
            setNextId(p => p + 1);
            setActiveWindowId(newWindow.id);
          }
          return newWindows;
        });
        
        // Reset drag state
        setDraggedTab(null);
        setDraggedTabPosition(null);
        setDropTargetWindowId(null);
      }
    };

    if (draggedTab) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp, { once: true });
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedTab, dropTargetWindowId, nextId]);
  
  const handleContextMenu = useCallback((e: React.MouseEvent, target: {type: string, path?: string, appId?: string}) => {
    e.preventDefault();
    e.stopPropagation();
    
    let items: ContextMenuItem[] = [];

    switch(target.type) {
      case 'desktop':
        items = [
            { label: 'Nova Pasta', action: () => { VFS.createDirectory('/home/user/Desktop/Nova Pasta'); updateVfs(); } },
            { label: 'Novo Documento de Texto', action: () => { VFS.createFile('/home/user/Desktop/Novo Documento.txt', ''); updateVfs(); } },
            { label: 'Atualizar', action: () => { updateVfs(); }, separator: true },
            { label: 'Configurações de Rede (Wi-Fi/Bluetooth)', action: () => { const a = ALL_APPS.find(x => x.id === 'devices'); if (a) openApp(a); } },
            { label: 'Personalizar', action: () => { const a = ALL_APPS.find(x => x.id === 'settings'); if (a) openApp(a); }, separator: true },
        ];
        break;
      case 'file':
        if (!target.path) break;
        const fullPath = target.path;
        items = [
          { label: 'Abrir', action: () => openPath(fullPath) },
          { label: 'Mover para a Lixeira', icon: <DeleteIcon/>, action: () => { VFS.moveToTrash(fullPath); updateVfs(); }, separator: true },
          { label: 'Renomear', action: () => {
              const newName = prompt('Digite o novo nome:');
              if (newName && newName.trim()) { VFS.renameNode(fullPath, newName.trim()); updateVfs(); }
          }}
        ];
        break;
      case 'app':
        if (!target.appId) break;
        const app = getAppById(target.appId);
        if (!app) break;
        items = [{ label: 'Abrir', action: () => openApp(app) }];
        break;
    }

    setContextMenu({ x: e.clientX, y: e.clientY, items });
  }, [openApp, openPath]);

  const availableApps = useMemo(() => {
    return ALL_APPS;
  }, []);

  const handleClickOutside = () => { setContextMenu(null); setStartMenuOpen(false); };

  return (
    <main className="w-screen h-screen overflow-hidden bg-black font-sans select-none" onContextMenu={(e) => handleContextMenu(e, {type: 'desktop'})} onClick={handleClickOutside}>
      <Desktop
        onOpenApp={openApp}
        onOpenPath={openPath}
        theme={theme}
        vfs={vfs}
        updateVfs={updateVfs}
        onContextMenu={handleContextMenu}
      />
      <div className="relative h-full w-full">
        {windows.filter(w => !w.isMinimized).map(instance => (
          <Window
            key={instance.id}
            instance={instance}
            onFocus={() => focusWindow(instance.id)}
            onUpdate={updateWindow}
            onToggleMaximize={() => toggleMaximize(instance.id)}
            onToggleMinimize={() => toggleMinimize(instance.id)}
            onCloseWindow={() => closeWindow(instance.id)}
            onCloseTab={closeTab}
            onSetActiveTab={setActiveTab}
            isActive={activeWindowId === instance.id}
            isClosing={closingWindows.includes(instance.id)}
            // For App components
            onOpenPath={openPath}
            onOpenApp={openApp}
            onExecuteFile={executeProgram}
            updateVfs={updateVfs}
            vfs={vfs}
            theme={theme}
            setTheme={setTheme}
            addNotification={addNotification}
            // For Tab Drag & Drop
            onTabDragStart={handleTabDragStart}
            onSetDropTarget={setDropTargetWindowId}
            isDropTarget={dropTargetWindowId === instance.id}
          />
        ))}
      </div>
      {draggedTab && draggedTabPosition && <DraggableTabPreview tab={draggedTab.tab} position={draggedTabPosition} />}
      <Notifications notifications={notifications} />
      {isCommandBarOpen && <NexusCommand apps={availableApps} onOpenApp={openApp} onOpenPath={openPath} onClose={() => setCommandBarOpen(false)} addNotification={addNotification} />}
      {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} items={contextMenu.items} onClose={() => setContextMenu(null)} />}
      <Taskbar 
        windows={windows} 
        activeWindowId={activeWindowId} 
        onFocusApp={focusWindow} 
        onToggleStartMenu={() => setStartMenuOpen(p => !p)} 
        onToggleCommandBar={() => setCommandBarOpen(p => !p)}
        onSetActiveTab={setActiveTab}
        onCloseTab={closeTab}
        onOpenAppById={(appId) => {
            const app = ALL_APPS.find(a => a.id === appId);
            if (app) openApp(app);
        }}
      />
      {isStartMenuOpen && <StartMenu onOpenApp={openApp} apps={availableApps} onContextMenu={handleContextMenu} />}
    </main>
  );
};

export default App;
