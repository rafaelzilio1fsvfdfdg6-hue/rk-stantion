import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ContextMenuItem } from '../types';

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleItemClick = (action: () => void) => {
    action();
    onClose();
  };
  
  const style: React.CSSProperties = {
      top: y,
      left: x,
  };

  return createPortal(
    <div ref={menuRef} style={style} className="context-menu" onContextMenu={(e) => e.preventDefault()}>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {item.separator && <div className="context-menu-separator" />}
          <button className="context-menu-item" onClick={() => handleItemClick(item.action)}>
            {item.icon && <span className="w-4 h-4">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        </React.Fragment>
      ))}
    </div>,
    document.body
  );
};

export default ContextMenu;