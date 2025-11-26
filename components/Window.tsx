import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WindowConfig, AppModule } from '../types';

interface WindowProps {
  children: React.ReactNode;
  config: WindowConfig;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onFocus: () => void;
  onUpdate: (updates: Partial<WindowConfig>) => void;
}

const getTitle = (id: AppModule) => {
    switch(id) {
        case AppModule.DASHBOARD: return 'Dashboard';
        case AppModule.TASKS: return 'Tasks';
        case AppModule.TIMER: return 'Time Tracker';
        case AppModule.POMODORO: return 'Focus Mode';
        case AppModule.JOURNAL: return 'Journal';
        case AppModule.SOCIAL: return 'Study Room';
        case AppModule.CHAT: return 'FocusFlow AI';
        default: return 'Application';
    }
};

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const Window: React.FC<WindowProps> = ({ children, config, onClose, onMinimize, onToggleMaximize, onFocus, onUpdate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeDirection | null>(null);

  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowStartRect = useRef({ x: 0, y: 0, width: 0, height: 0 });
  
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || config.isMaximized) return;
    onFocus();
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    windowStartRect.current = { x: config.x, y: config.y, width: config.width, height: config.height };
  };

  const handleResizeStart = (direction: ResizeDirection) => (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.button !== 0 || config.isMaximized) return;
    onFocus();
    setIsResizing(direction);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    windowStartRect.current = { x: config.x, y: config.y, width: config.width, height: config.height };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStartPos.current.x;
      const dy = e.clientY - dragStartPos.current.y;
      onUpdate({ x: windowStartRect.current.x + dx, y: windowStartRect.current.y + dy });
    }
    if (isResizing) {
        let { x, y, width, height } = windowStartRect.current;
        const dx = e.clientX - dragStartPos.current.x;
        const dy = e.clientY - dragStartPos.current.y;
        
        if (isResizing.includes('e')) width += dx;
        if (isResizing.includes('s')) height += dy;
        if (isResizing.includes('w')) { width -= dx; x += dx; }
        if (isResizing.includes('n')) { height -= dy; y += dy; }
        
        onUpdate({ x, y, width: Math.max(300, width), height: Math.max(200, height) });
    }
  }, [isDragging, isResizing, onUpdate]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp, { once: true });
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);
  
  const maximizedStyles = config.isMaximized ? {
    top: 0, left: 0, width: '100%', height: '100%', borderRadius: 0,
  } : {
    top: config.y, left: config.x, width: config.width, height: config.height,
  };

  const windowClasses = `
    absolute bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-black/20 
    rounded-[var(--window-border-radius)] shadow-window flex flex-col overflow-hidden
    ${config.isMinimized ? 'opacity-0 scale-90 -translate-y-4' : 'opacity-100 scale-100'}
    ${config.isMaximized ? 'transition-none' : 'transition-all duration-200'}
  `;

  return (
    <div
      className={windowClasses}
      style={{ ...maximizedStyles, zIndex: config.zIndex, pointerEvents: config.isMinimized ? 'none' : 'auto' }}
      onMouseDown={onFocus}
    >
      {/* Resizers */}
      {!config.isMaximized && (
        <>
            <div onMouseDown={handleResizeStart('n')} className="absolute top-0 left-2 right-2 h-2 cursor-n-resize" />
            <div onMouseDown={handleResizeStart('s')} className="absolute bottom-0 left-2 right-2 h-2 cursor-s-resize" />
            <div onMouseDown={handleResizeStart('w')} className="absolute top-2 bottom-2 left-0 w-2 cursor-w-resize" />
            <div onMouseDown={handleResizeStart('e')} className="absolute top-2 bottom-2 right-0 w-2 cursor-e-resize" />
            <div onMouseDown={handleResizeStart('nw')} className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize" />
            <div onMouseDown={handleResizeStart('ne')} className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize" />
            <div onMouseDown={handleResizeStart('sw')} className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize" />
            <div onMouseDown={handleResizeStart('se')} className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize" />
        </>
      )}

      {/* Title Bar */}
      <div
        className="h-9 flex items-center justify-between px-3 flex-shrink-0 bg-gradient-to-b from-white/50 to-transparent dark:from-white/10"
        onMouseDown={handleDragStart}
        onDoubleClick={onToggleMaximize}
        style={{ cursor: isDragging ? 'grabbing' : (config.isMaximized ? 'default' : 'grab') }}
      >
        <div className="flex items-center gap-2">
          <button onClick={onClose} className="w-3 h-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors"></button>
          <button onClick={onMinimize} className="w-3 h-3 bg-yellow-500 rounded-full hover:bg-yellow-600 transition-colors"></button>
          <button onClick={onToggleMaximize} className="w-3 h-3 bg-green-500 rounded-full hover:bg-green-600 transition-colors"></button>
        </div>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 select-none">
            {getTitle(config.id)}
        </span>
        <div className="w-12"></div>
      </div>
      
      {/* Content */}
      <div className="flex-1 bg-gray-50/80 dark:bg-slate-900/80 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default Window;