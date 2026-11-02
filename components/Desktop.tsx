import React, { useState } from 'react';
import { AppDefinition, VFSNode, ContextMenuItem } from '../types';
import * as VFS from '../services/virtualFileSystem';

interface DesktopProps {
  onOpenApp: (app: AppDefinition) => void;
  onOpenPath: (path: string) => void;
  theme: { wallpaper: string; accentColor: string };
  vfs: VFSNode | null;
  updateVfs: () => void;
  onContextMenu: (e: React.MouseEvent, target: { type: string; path?: string; appId?: string }) => void;
}

const Desktop: React.FC<DesktopProps> = ({ onOpenApp, onOpenPath, theme, onContextMenu, updateVfs }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const desktopPath = '/home/user/Desktop';
  const desktopNode = VFS.getNode(desktopPath);
  const desktopItems = (desktopNode && desktopNode.type === 'directory') ? Object.values(desktopNode.children) : [];
  const trashItems = VFS.getTrashItems();

  const systemShortcuts = [
    {
      id: 'this_pc',
      name: 'Este Computador',
      icon: (
        <div className="w-11 h-11 rounded-lg bg-gradient-to-tr from-blue-700 to-cyan-500 p-2 text-white shadow-lg flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M4 4h16a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 15h16v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-1z" />
          </svg>
        </div>
      ),
      action: () => onOpenPath('/')
    },
    {
      id: 'trash',
      name: `Lixeira ${trashItems.length > 0 ? `(${trashItems.length})` : '(Vazia)'}`,
      icon: (
        <div className="w-11 h-11 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-800 p-2 text-white shadow-lg flex items-center justify-center relative">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.904a.75.75 0 00-1.5.058l.5 8.5a.75.75 0 001.5-.058l-.5-8.5zm5.482.058a.75.75 0 10-1.498-.058l-.5 8.5a.75.75 0 001.498.058l.5-8.5z" clipRule="evenodd" />
          </svg>
          {trashItems.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              {trashItems.length}
            </span>
          )}
        </div>
      ),
      action: () => onOpenPath('/trash')
    },
    {
      id: 'chrome',
      name: 'Google Chrome',
      icon: (
        <div className="w-11 h-11 p-1 bg-white rounded-full shadow-lg flex items-center justify-center">
          <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="10" fill="#ffffff" />
            <path fill="#ea4335" d="M24 14h18.2C38.6 8.3 31.8 4 24 4c-7 0-13.3 3.5-17.2 8.8l9.1 15.8c1.7-8.4 4.5-14.6 8.1-14.6z" />
            <path fill="#fbbc05" d="M34.7 24l-9.1 15.8c-1.6.2-3.2.2-4.8 0l9.1-15.8c2.9 5.1 8.2 8.7 14.3 9.7L34.7 24z" />
            <path fill="#34a853" d="M6.8 12.8L15.9 28.6c-1.8 3.1-2.9 6.8-2.9 10.6 0 1.6.2 3.2.5 4.8L24 44c11 0 20-9 20-20h-9.3c0 6.6-4.6 12.1-10.9 13.5L6.8 12.8z" />
            <circle cx="24" cy="24" r="7.5" fill="#1a73e8" />
          </svg>
        </div>
      ),
      action: () => onOpenPath('/browser')
    },
    {
      id: 'devices',
      name: 'Wi-Fi & Bluetooth (Dispositivos)',
      icon: (
        <div className="w-11 h-11 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-700 p-2 text-white shadow-lg flex items-center justify-center relative">
          <span className="text-xl">📶</span>
          <span className="absolute bottom-1 right-1 text-[10px]">ᛒ</span>
        </div>
      ),
      action: () => onOpenPath('/devices')
    },
    {
      id: 'documents',
      name: 'Documentos',
      icon: (
        <div className="w-11 h-11 rounded-lg bg-gradient-to-tr from-yellow-500 to-amber-600 p-2 text-white shadow-lg flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-1.5V9a3 3 0 00-3-3h-3.379a3 3 0 01-2.121-.879L8.379 4.12A3 3 0 006.257 3.24H4.5A3 3 0 001.5 6.24v11.76a3 3 0 003 3h15z" />
          </svg>
        </div>
      ),
      action: () => onOpenPath('/home/user/Documents')
    }
  ];

  return (
    <div
      className="absolute inset-0 h-[calc(100%-52px)] w-full select-none overflow-hidden"
      style={{
        backgroundImage: theme.wallpaper
          ? `url(${theme.wallpaper})`
          : `radial-gradient(ellipse at 70% 30%, #1e3a8a 0%, #0f172a 50%, #030712 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onClick={() => setSelectedId(null)}
      onContextMenu={(e) => onContextMenu(e, { type: 'desktop' })}
    >
      {/* Windows 10 Ambient Glow Lines */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

      {/* Desktop Grid of Icons */}
      <div className="absolute top-4 left-4 z-10 grid grid-flow-col grid-rows-6 gap-3">
        {/* System Windows Shortcuts */}
        {systemShortcuts.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <div
              key={item.id}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(item.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                item.action();
              }}
              className={`w-24 h-24 p-2 rounded-md flex flex-col items-center justify-center text-center cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-blue-600/30 border-blue-400/80 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                  : 'border-transparent hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {item.icon}
              <span className="text-white text-[11px] font-medium mt-1.5 leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] line-clamp-2">
                {item.name}
              </span>
            </div>
          );
        })}

        {/* User Files on Desktop */}
        {desktopItems.map((item: VFSNode) => {
          const isSelected = selectedId === item.name;
          const isDir = item.type === 'directory';
          const isExe = item.name.endsWith('.exe');

          return (
            <div
              key={item.name}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(item.name);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onOpenPath(`${desktopPath}/${item.name}`);
              }}
              onContextMenu={(e) => {
                onContextMenu(e, { type: 'file', path: `${desktopPath}/${item.name}` });
              }}
              className={`w-24 h-24 p-2 rounded-md flex flex-col items-center justify-center text-center cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-blue-600/30 border-blue-400/80 shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                  : 'border-transparent hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className="w-11 h-11 flex items-center justify-center">
                {isDir ? (
                  <svg className="w-10 h-10 text-yellow-400 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-1.5V9a3 3 0 00-3-3h-3.379a3 3 0 01-2.121-.879L8.379 4.12A3 3 0 006.257 3.24H4.5A3 3 0 001.5 6.24v11.76a3 3 0 003 3h15z" />
                  </svg>
                ) : isExe ? (
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-blue-700 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shadow-md">
                    EXE
                  </div>
                ) : (
                  <svg className="w-10 h-10 text-blue-300 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M5.625 1.5H9a3.75 3.75 0 013.75 3.75v1.875c0 1.036.84 1.875 1.875 1.875H16.5a3.75 3.75 0 013.75 3.75v7.875c0 1.035-.84 1.875-1.875 1.875H5.625a1.875 1.875 0 01-1.875-1.875V3.375c0-1.036.84-1.875 1.875-1.875zM9.75 14.25a.75.75 0 000 1.5H15a.75.75 0 000-1.5H9.75zM9.75 10.5a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-white text-[11px] font-medium mt-1 truncate w-full drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                {item.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Windows 10 Watermark at bottom right */}
      <div className="absolute bottom-4 right-4 text-right pointer-events-none text-white/30 font-sans text-xs">
        <p className="font-semibold">Widons 2.0 Pro</p>
        <p className="text-[10px]">Plug &amp; Play • Wi-Fi 6E &amp; Bluetooth 5.3 Ativos</p>
      </div>
    </div>
  );
};

export default Desktop;