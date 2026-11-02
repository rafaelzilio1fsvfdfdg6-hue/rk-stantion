import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WindowInstance, TabInstance } from '../types';

interface WindowProps {
  instance: WindowInstance;
  onFocus: () => void;
  onUpdate: (id: number, updates: Partial<WindowInstance>) => void;
  onToggleMaximize: () => void;
  onToggleMinimize: () => void;
  onCloseWindow: () => void;
  onCloseTab: (windowId: number, tabId: string) => void;
  onSetActiveTab: (windowId: number, tabId: string) => void;
  isActive: boolean;
  isClosing: boolean;
  // App context props
  [key: string]: any; // To pass through all other props to app components
  // Tab Drag & Drop
  onTabDragStart: (windowId: number, tab: TabInstance, e: React.MouseEvent) => void;
  onSetDropTarget: (windowId: number | null) => void;
  isDropTarget: boolean;
}

const MinimizeIcon: React.FC = () => ( <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line></svg> );
const MaximizeIcon: React.FC = () => ( <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="1" ry="1"></rect></svg> );
const RestoreIcon: React.FC = () => ( <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path></svg> );
const CloseIcon: React.FC<{onClick: (e: React.MouseEvent) => void}> = ({onClick}) => ( <button type="button" onClick={onClick} className="tab-close-button w-5 h-5 flex items-center justify-center rounded-sm hover:bg-red-500 hover:text-white text-gray-400 text-xs transition-colors ml-1" title="Fechar Aba">✕</button> );

const Window: React.FC<WindowProps> = (props) => {
  const { instance, onFocus, onUpdate, onToggleMaximize, onToggleMinimize, onCloseWindow, onCloseTab, onSetActiveTab, isActive, isClosing, onTabDragStart, onSetDropTarget, isDropTarget } = props;
  
  const [isNew, setIsNew] = useState(true);
  const dragStartRef = useRef({ x: 0, y: 0, winX: 0, winY: 0, winW: 0, winH: 0, isDragging: false, isResizing: false, resizeHandle: '' });
  
  const isMobile = window.innerWidth < 768;
  const activeTab = instance.tabs.find(t => t.id === instance.activeTabId) || instance.tabs[0];

  useEffect(() => {
    const timer = setTimeout(() => setIsNew(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>, handle?: string) => {
    if (isMobile || instance.isMaximized) return;
    if ((e.target as HTMLElement).closest('.tab-button')) return;

    e.preventDefault();
    e.stopPropagation();
    onFocus();

    const state = dragStartRef.current;
    state.isDragging = !handle;
    state.isResizing = !!handle;
    state.resizeHandle = handle || '';
    state.x = e.clientX;
    state.y = e.clientY;
    state.winX = instance.position.x;
    state.winY = instance.position.y;
    state.winW = instance.size.width;
    state.winH = instance.size.height;
  }, [instance, onFocus, isMobile]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
      const state = dragStartRef.current;
      if (!state.isDragging && !state.isResizing) return;
      
      const dx = e.clientX - state.x;
      const dy = e.clientY - state.y;
      
      let newPos = { ...instance.position };
      let newSize = { ...instance.size };

      if (state.isDragging) {
        newPos = { x: state.winX + dx, y: state.winY + dy };
      } else if (state.isResizing) {
          const minW = 300, minH = 200;
          if (state.resizeHandle.includes('e')) newSize.width = Math.max(minW, state.winW + dx);
          if (state.resizeHandle.includes('s')) newSize.height = Math.max(minH, state.winH + dy);
          if (state.resizeHandle.includes('w')) {
              newSize.width = Math.max(minW, state.winW - dx);
              newPos.x = state.winX + dx;
          }
          if (state.resizeHandle.includes('n')) {
              newSize.height = Math.max(minH, state.winH - dy);
              newPos.y = state.winY + dy;
          }
      }
      onUpdate(instance.id, { position: newPos, size: newSize });
  }, [instance.id, onUpdate]);

  const handleMouseUp = useCallback(() => {
    dragStartRef.current.isDragging = false;
    dragStartRef.current.isResizing = false;
  }, []);

  useEffect(() => {
    const isInteracting = dragStartRef.current.isDragging || dragStartRef.current.isResizing;
    if (isInteracting) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  
  const zIndex = isActive ? 40 : 30;
  
  const isEffectivelyMaximized = instance.isMaximized || (isMobile && !instance.isMinimized);

  const windowClasses = `
    fixed flex flex-col bg-black/80 backdrop-blur-lg border rounded-lg overflow-hidden
    ${!instance.isMaximized ? 'transition-[width,height,top,left] duration-100 ease-in-out' : ''}
    ${isActive ? 'shadow-[0_0_30px_rgba(var(--accent-color-rgb),0.5)]' : 'border-gray-600 shadow-lg'}
    ${isMobile ? 'inset-0 md:inset-auto rounded-none !h-[calc(100%-56px)] !w-full' : ''}
    ${isNew && !isMobile ? 'animate-scale-in' : ''}
    ${isClosing && !isMobile ? 'animate-scale-out' : ''}
  `;
  
  const windowStyles: React.CSSProperties = isMobile ? { zIndex, top: 0, left: 0 } : { 
    top: instance.position.y, 
    left: instance.position.x, 
    width: instance.size.width, 
    height: instance.size.height, 
    zIndex 
  };
   if (isActive) windowStyles.borderColor = 'var(--accent-color)';

  const AppToRender = activeTab.app.component;

  return (
    <div 
      className={windowClasses} 
      style={windowStyles} 
      onMouseDown={onFocus}
      onMouseEnter={() => onSetDropTarget(instance.id)}
      onMouseLeave={() => onSetDropTarget(null)}
    >
      <div 
        className={`flex items-end justify-between ${isEffectivelyMaximized ? 'cursor-default' : 'cursor-move'} ${isActive ? 'bg-[rgba(var(--accent-color-rgb),0.3)]' : 'bg-gray-800/50'}`}
        onMouseDown={(e) => handleMouseDown(e)}
        onDoubleClick={isMobile ? undefined : onToggleMaximize}
      >
        <div className="flex-grow flex items-end min-w-0" role="tablist">
          {instance.tabs.map(tab => (
            <div
              key={tab.id}
              role="tab"
              tabIndex={0}
              aria-selected={tab.id === activeTab.id}
              onClick={() => onSetActiveTab(instance.id, tab.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSetActiveTab(instance.id, tab.id);
                }
              }}
              onMouseDown={(e) => { e.stopPropagation(); onTabDragStart(instance.id, tab, e); }}
              className={`tab-button cursor-pointer select-none flex items-center gap-2 max-w-56 border-r px-3 pt-2 pb-1.5 transition-colors duration-150 outline-none
                ${tab.id === activeTab.id 
                    ? 'bg-black/30 rounded-t-sm shadow-sm' 
                    : 'bg-black/10 hover:bg-black/20 border-b'}`
              }
              style={{ 
                borderColor: isActive ? 'var(--accent-color)' : 'rgb(75 85 99)',
                borderBottomColor: tab.id === activeTab.id ? 'transparent' : (isActive ? 'var(--accent-color)' : 'rgb(75 85 99)'),
              }}
            >
              <div className="w-4 h-4 flex-shrink-0" style={{color: 'var(--accent-color)'}}>{tab.app.icon}</div>
              <span className="text-xs font-medium text-white truncate flex-shrink">{tab.title || tab.app.name}</span>
              <CloseIcon onClick={(e) => { e.stopPropagation(); onCloseTab(instance.id, tab.id); }} />
            </div>
          ))}
          <div className={`flex-grow h-full border-b ${isDropTarget ? 'bg-cyan-500/30' : ''}`} style={{ borderColor: isActive ? 'var(--accent-color)' : 'rgb(75 85 99)' }}></div>
        </div>

        {/* Windows 10 Standard Window Controls */}
        <div className="flex items-center flex-shrink-0">
            {!isMobile && ( <>
              <button 
                type="button" 
                onClick={onToggleMinimize} 
                className="w-11 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors" 
                title="Minimizar"
              >
                <MinimizeIcon />
              </button>
              <button 
                type="button" 
                onClick={onToggleMaximize} 
                className="w-11 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-colors" 
                title={instance.isMaximized ? "Restaurar" : "Maximizar"}
              >
                {instance.isMaximized ? <RestoreIcon /> : <MaximizeIcon />}
              </button>
            </>)}
            <button 
              type="button" 
              onClick={onCloseWindow} 
              className="w-11 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-[#e81123] transition-colors" 
              title="Fechar"
            >
              <span className="text-sm font-normal">✕</span>
            </button>
        </div>
      </div>
      <div className="flex-grow p-1 overflow-auto bg-black/20 relative">
        {activeTab && <AppToRender
          key={activeTab.id} // This is crucial to re-mount the component when tab changes
          {...props} // Pass down all the context from App.tsx
          windowId={instance.id}
          tabId={activeTab.id}
          filePath={activeTab.filePath}
          onClose={() => onCloseTab(instance.id, activeTab.id)}
         />}
      </div>
      {!isEffectivelyMaximized && (<>
          <div className="resize-handle resize-handle-n" onMouseDown={e => handleMouseDown(e, 'n')}></div>
          <div className="resize-handle resize-handle-s" onMouseDown={e => handleMouseDown(e, 's')}></div>
          <div className="resize-handle resize-handle-w" onMouseDown={e => handleMouseDown(e, 'w')}></div>
          <div className="resize-handle resize-handle-e" onMouseDown={e => handleMouseDown(e, 'e')}></div>
          <div className="resize-handle resize-handle-nw" onMouseDown={e => handleMouseDown(e, 'nw')}></div>
          <div className="resize-handle resize-handle-ne" onMouseDown={e => handleMouseDown(e, 'ne')}></div>
          <div className="resize-handle resize-handle-sw" onMouseDown={e => handleMouseDown(e, 'sw')}></div>
          <div className="resize-handle resize-handle-se" onMouseDown={e => handleMouseDown(e, 'se')}></div>
        </>
      )}
    </div>
  );
};

export default Window;
