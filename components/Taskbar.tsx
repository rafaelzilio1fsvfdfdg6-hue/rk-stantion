import React, { useState, useEffect } from 'react';
import { WindowInstance, AppDefinition } from '../types';

interface TaskbarProps {
  windows: WindowInstance[];
  activeWindowId: number | null;
  onFocusApp: (id: number) => void;
  onToggleStartMenu: () => void;
  onToggleCommandBar: () => void;
  onSetActiveTab: (windowId: number, tabId: string) => void;
  onCloseTab: (windowId: number, tabId: string) => void;
  onOpenAppById?: (appId: string) => void;
}

const WindowsLogo: React.FC = () => (
  <svg viewBox="0 0 88 88" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 12.402l35.689-4.86.016 34.423-35.67.203zm35.67 33.529l.029 34.453-35.67-4.891-.029-29.359zm4.327-39.027l47.994-6.904v41.671l-47.994.229zm47.999 38.835v41.716l-47.994-6.758v-34.958z" />
  </svg>
);

const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  activeWindowId,
  onFocusApp,
  onToggleStartMenu,
  onToggleCommandBar,
  onSetActiveTab,
  onCloseTab,
  onOpenAppById,
}) => {
  const [hoveredAppId, setHoveredAppId] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showWifiFlyout, setShowWifiFlyout] = useState(false);
  const [showBtFlyout, setShowBtFlyout] = useState(false);
  const [showVolumeFlyout, setShowVolumeFlyout] = useState(false);
  const [volume, setVolume] = useState(85);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const closeAllFlyouts = () => {
    setShowWifiFlyout(false);
    setShowBtFlyout(false);
    setShowVolumeFlyout(false);
  };

  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-[52px] bg-[#101318]/90 backdrop-blur-xl border-t border-white/10 z-50 flex items-center justify-between px-1 select-none"
      onClick={closeAllFlyouts}
    >
      {/* Left: Start Button & Search Box */}
      <div className="flex items-center gap-1.5 h-full">
        {/* Windows 10 Start Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            closeAllFlyouts();
            onToggleStartMenu();
          }}
          className="w-12 h-full flex items-center justify-center text-cyan-400 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors"
          title="Iniciar Widons 2.0"
        >
          <WindowsLogo />
        </button>

        {/* Windows 10 Search Box */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggleCommandBar();
          }}
          className="hidden md:flex items-center gap-2 bg-[#212733]/90 hover:bg-[#2a3240] border border-white/10 hover:border-blue-400/60 rounded px-3 py-1.5 h-9 w-64 cursor-pointer text-xs text-gray-300 transition-all shadow-inner"
        >
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="truncate">Digite aqui para pesquisar</span>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-white/10 mx-1 hidden md:block" />

        {/* Taskbar Windows App Buttons */}
        <div className="flex items-center gap-1 h-full overflow-x-auto">
          {windows.map((win) => {
            const isActive = win.id === activeWindowId;
            const isMinimized = win.isMinimized;
            const activeTab = win.tabs.find((t) => t.id === win.activeTabId) || win.tabs[0];
            if (!activeTab) return null;

            return (
              <div
                key={win.id}
                className="relative h-full flex items-center"
                onMouseEnter={() => setHoveredAppId(win.id)}
                onMouseLeave={() => setHoveredAppId(null)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFocusApp(win.id);
                  }}
                  className={`relative h-11 px-3 flex items-center gap-2 rounded transition-all duration-150 ${
                    isActive
                      ? 'bg-white/15 text-white shadow-sm'
                      : 'hover:bg-white/10 text-gray-300'
                  }`}
                  title={activeTab.app.name}
                >
                  <div className={`w-5 h-5 flex-shrink-0 ${isMinimized ? 'opacity-50' : ''}`}>
                    {activeTab.app.icon}
                  </div>
                  <span className="text-xs truncate max-w-[120px] hidden sm:inline">
                    {activeTab.title || activeTab.app.name}
                  </span>
                  {/* Windows 10 Active Underline Bar */}
                  <div
                    className={`absolute bottom-0 left-1 right-1 h-1 rounded-t-sm transition-all duration-200 ${
                      isActive ? 'bg-cyan-400 shadow-[0_0_8px_#00f0ff]' : 'bg-transparent'
                    }`}
                  />
                </button>

                {/* Hover Preview Box */}
                {hoveredAppId === win.id && (
                  <div
                    className="absolute bottom-full mb-2 w-60 bg-[#1c212c]/95 backdrop-blur-xl border border-cyan-500/40 rounded-lg shadow-2xl p-2.5 z-50 animate-scale-in origin-bottom"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-white/10 mb-1.5">
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-4 h-4 text-cyan-400">{activeTab.app.icon}</div>
                        <span className="text-xs font-semibold text-white truncate">
                          {activeTab.app.name}
                        </span>
                      </div>
                      <button
                        onClick={() => onCloseTab(win.id, activeTab.id)}
                        className="text-gray-400 hover:text-red-400 p-0.5 rounded text-xs"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate">
                      {activeTab.title || 'Janela do Widons 2.0'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: Windows 10 System Tray (Wi-Fi, Bluetooth, Audio, Clock, Action Center) */}
      <div className="flex items-center gap-1.5 h-full relative">
        {/* Wi-Fi Icon & Status */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowBtFlyout(false);
            setShowVolumeFlyout(false);
            setShowWifiFlyout((v) => !v);
          }}
          className={`h-full px-2.5 flex items-center justify-center rounded transition-colors text-white ${
            showWifiFlyout ? 'bg-white/20' : 'hover:bg-white/10'
          }`}
          title="Adaptador Wi-Fi 6E (Conectado à Internet)"
        >
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3c-4.97 0-9.47 2.01-12.73 5.27l1.42 1.42C3.32 7.06 7.42 5.25 12 5.25s8.68 1.81 11.31 4.44l1.42-1.42C21.47 5.01 16.97 3 12 3zm0 5c-3.6 0-6.85 1.46-9.2 3.8l1.42 1.42C6.01 11.43 8.86 10.25 12 10.25s5.99 1.18 7.78 2.97l1.42-1.42C18.85 9.46 15.6 8 12 8zm0 5c-2.22 0-4.23.9-5.66 2.34l5.66 5.66 5.66-5.66C16.23 13.9 14.22 13 12 13z" />
            </svg>
          </div>
        </button>

        {/* Bluetooth Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowWifiFlyout(false);
            setShowVolumeFlyout(false);
            setShowBtFlyout((v) => !v);
          }}
          className={`h-full px-2.5 flex items-center justify-center rounded transition-colors text-white ${
            showBtFlyout ? 'bg-white/20' : 'hover:bg-white/10'
          }`}
          title="Adaptador Bluetooth 5.3 (Ativo)"
        >
          <span className="font-mono font-bold text-blue-400 text-sm">ᛒ</span>
        </button>

        {/* Volume Speaker */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowWifiFlyout(false);
            setShowBtFlyout(false);
            setShowVolumeFlyout((v) => !v);
          }}
          className={`h-full px-2.5 flex items-center justify-center rounded transition-colors text-white ${
            showVolumeFlyout ? 'bg-white/20' : 'hover:bg-white/10'
          }`}
          title={`Alto-falantes: ${volume}%`}
        >
          <svg className="w-4 h-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </button>

        {/* Battery */}
        <div className="hidden sm:flex items-center px-1 text-gray-300 text-xs gap-1" title="Bateria: 100% Conectada à tomada">
          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h15M3 14h15m2-4v4m-18 2h18a2 2 0 002-2V8a2 2 0 00-2-2H2a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Windows Date & Time */}
        <div
          className="h-full px-2.5 flex flex-col justify-center items-end text-right hover:bg-white/10 rounded cursor-pointer transition text-white leading-tight"
          title={currentTime.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        >
          <span className="text-xs font-semibold">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-[10px] text-gray-300">
            {currentTime.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </span>
        </div>

        {/* Windows 10 Action Center Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCommandBar();
          }}
          className="w-10 h-full flex items-center justify-center hover:bg-white/10 text-gray-300 hover:text-white transition"
          title="Central de Ações do Widons"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </button>

        {/* Wi-Fi Flyout */}
        {showWifiFlyout && (
          <div
            className="absolute bottom-full right-2 mb-2 w-72 bg-[#1c222e] border border-cyan-500/50 rounded-xl shadow-2xl p-4 text-xs text-white z-50 animate-scale-in origin-bottom-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <span className="text-emerald-400">📶</span> Wi-Fi 6E (Intel AX210)
              </h4>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded">
                Ativo
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="p-2.5 rounded-lg bg-blue-600/20 border border-blue-400/40">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">Wi-Fi_Casa_5GHz</span>
                  <span className="text-emerald-400 font-bold text-[10px]">Conectado</span>
                </div>
                <p className="text-[10px] text-gray-300 mt-0.5">Seguro • 2402 Mbps • 5 GHz</p>
              </div>

              <div className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-transparent flex justify-between items-center cursor-pointer">
                <div>
                  <p className="font-medium text-gray-200">Widons_Fibra_Ultra</p>
                  <p className="text-[10px] text-gray-400">Sinal Forte • WPA2</p>
                </div>
                <button className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-[10px]">
                  Conectar
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setShowWifiFlyout(false);
                onOpenAppById?.('devices');
              }}
              className="w-full py-1.5 text-center text-xs text-cyan-300 hover:text-white hover:underline bg-white/5 rounded"
            >
              Abrir Gerenciador de Dispositivos &gt;
            </button>
          </div>
        )}

        {/* Bluetooth Flyout */}
        {showBtFlyout && (
          <div
            className="absolute bottom-full right-8 mb-2 w-72 bg-[#1c222e] border border-blue-500/50 rounded-xl shadow-2xl p-4 text-xs text-white z-50 animate-scale-in origin-bottom-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-3">
              <h4 className="font-bold text-sm flex items-center gap-2">
                <span className="text-blue-400">ᛒ</span> Bluetooth 5.3
              </h4>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded">
                Ativo
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="p-2 rounded bg-white/5 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Sony WH-1000XM5</p>
                  <p className="text-[10px] text-emerald-400">Conectado (Bateria: 92%)</p>
                </div>
                <span>🎧</span>
              </div>
              <div className="p-2 rounded bg-white/5 flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Mouse MX Master 3S</p>
                  <p className="text-[10px] text-emerald-400">Conectado (Bateria: 85%)</p>
                </div>
                <span>🖱️</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowBtFlyout(false);
                onOpenAppById?.('devices');
              }}
              className="w-full py-1.5 text-center text-xs text-cyan-300 hover:text-white hover:underline bg-white/5 rounded"
            >
              Configurar Periféricos Bluetooth &gt;
            </button>
          </div>
        )}

        {/* Volume Flyout */}
        {showVolumeFlyout && (
          <div
            className="absolute bottom-full right-16 mb-2 w-64 bg-[#1c222e] border border-white/20 rounded-xl shadow-2xl p-4 text-xs text-white z-50 animate-scale-in origin-bottom-right"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-300">Alto-falantes (Realtek HD)</span>
              <span className="font-bold text-cyan-400 font-mono">{volume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Taskbar;