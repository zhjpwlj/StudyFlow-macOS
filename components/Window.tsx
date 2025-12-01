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
        case AppModule.SETTINGS: return 'Settings';
        case AppModule.CALCULATOR: return 'Calculator';
        case AppModule.NOTES: return 'Notes';
        case AppModule.WEATHER: return 'Weather';
        default: return 'Application';
    }
};

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const Window: React.FC<WindowProps> = ({ children, config, onClose, onMinimize, onToggleMaximize, onFocus, onUpdate }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeDirection | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  
  const windowRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const windowStartRect = useRef({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    // Trigger the mount animation
    const timeout = setTimeout(() => setIsMounted(true), 10);
    return () => clearTimeout(timeout);
  }, []);

  const getEventCoords = (e: MouseEvent | TouchEvent) => {
    return 'touches' in e ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };
  };

  const handleStart = useCallback((
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    action: 'drag' | { type: 'resize', direction: ResizeDirection }
  ) => {
    if ('button' in e && e.button !== 0) return;
    if (config.isMaximized) return;

    // Check if clicking a button in the title bar
    if (action === 'drag' && (e.target as HTMLElement).closest('button')) return;

    e.stopPropagation();
    onFocus();
    
    const { x, y } = getEventCoords(e.nativeEvent);
    dragStartPos.current = { x, y };
    windowStartRect.current = { x: config.x, y: config.y, width: config.width, height: config.height };

    if (action === 'drag') {
      setIsDragging(true);
    } else if (action.type === 'resize') {
      setIsResizing(action.direction);
    }
  }, [config.isMaximized, config.x, config.y, config.width, config.height, onFocus]);
  
  const handleMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (e.cancelable) e.preventDefault();
    
    const { x: clientX, y: clientY } = getEventCoords(e);
    const dx = clientX - dragStartPos.current.x;
    const dy = clientY - dragStartPos.current.y;
    
    if (!windowRef.current) return;

    if (isDragging) {
      const newX = windowStartRect.current.x + dx;
      const newY = windowStartRect.current.y + dy;
      onUpdate({ x: newX, y: newY });
    }
    
    if (isResizing) {
        let { x, y, width, height } = windowStartRect.current;
        
        if (isResizing.includes('e')) width += dx;
        if (isResizing.includes('s')) height += dy;
        if (isResizing.includes('w')) { width -= dx; x += dx; }
        if (isResizing.includes('n')) { height -= dy; y += dy; }
        
        onUpdate({ 
            x, 
            y, 
            width: Math.max(300, width), 
            height: Math.max(200, height) 
        });
    }
  }, [isDragging, isResizing, onUpdate]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setIsResizing(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd, { once: true });
        document.addEventListener('touchmove', handleMove, { passive: false });
        document.addEventListener('touchend', handleEnd, { once: true });
    }
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, isResizing, handleMove, handleEnd]);

  const windowClasses = `
    absolute bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-black/20 
    rounded-[var(--window-border-radius)] shadow-window flex flex-col overflow-hidden transition-all duration-300 ease-out
    ${(isMounted && !config.isClosing && !config.isMinimized) ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
    ${config.isMinimized ? 'translate-y-16' : ''}
  `;

  const dynamicStyles: React.CSSProperties = {
    top: config.y,
    left: config.x,
    width: config.width,
    height: config.height,
    zIndex: config.zIndex,
    pointerEvents: config.isMinimized ? 'none' : 'auto',
    transitionProperty: isDragging || isResizing ? 'none' : 'transform, opacity, top, left, width, height',
  };
  
  if (config.isMaximized) {
    dynamicStyles.top = 0;
    dynamicStyles.left = 0;
    dynamicStyles.width = '100%';
    dynamicStyles.height = '100%';
    dynamicStyles.borderRadius = 0;
  }

  return (
    <div
      ref={windowRef}
      className={windowClasses}
      style={dynamicStyles}
      onMouseDown={onFocus}
      onTouchStart={onFocus}
    >
      {/* Resizers */}
      {!config.isMaximized && (
        <>
            <div onMouseDown={(e) => handleStart(e, {type: 'resize', direction: 'n'})} onTouchStart={(e) => handleStart(e, {type: 'resize', direction: 'n'})} className="absolute top-0 left-2 right-2 h-2 cursor-n-resize" />
            <div onMouseDown={(e) => handleStart(e, {type: 'resize', direction: 's'})} onTouchStart={(e) => handleStart(e, {type: 'resize', direction: 's'})} className="absolute bottom-0 left-2 right-2 h-2 cursor-s-resize" />
            <div onMouseDown={(e) => handleStart(e, {type: 'resize', direction: 'w'})} onTouchStart={(e) => handleStart(e, {type: 'resize', direction: 'w'})} className="absolute top-2 bottom-2 left-0 w-2 cursor-w-resize" />
            <div onMouseDown={(e) => handleStart(e, {type: 'resize', direction: 'e'})} onTouchStart={(e) => handleStart(e, {type: 'resize', direction: 'e'})} className="absolute top-2 bottom-2 right-0 w-2 cursor-e-resize" />
            <div onMouseDown={(e) => handleStart(e, {type: 'resize', direction: 'nw'})} onTouchStart={(e) => handleStart(e, {type: 'resize', direction: 'nw'})} className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize" />
            <div onMouseDown={(e) => handleStart(e, {type: 'resize', direction: 'ne'})} onTouchStart={(e) => handleStart(e, {type: 'resize', direction: 'ne'})} className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize" />
            <div onMouseDown={(e) => handleStart(e, {type: 'resize', direction: 'sw'})} onTouchStart={(e) => handleStart(e, {type: 'resize', direction: 'sw'})} className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize" />
            <div onMouseDown={(e) => handleStart(e, {type: 'resize', direction: 'se'})} onTouchStart={(e) => handleStart(e, {type: 'resize', direction: 'se'})} className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize" />
        </>
      )}

      {/* Title Bar */}
      <div
        className="h-9 flex items-center justify-between px-3 flex-shrink-0 bg-gradient-to-b from-white/50 to-transparent dark:from-white/10"
        onMouseDown={(e) => handleStart(e, 'drag')}
        onTouchStart={(e) => handleStart(e, 'drag')}
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
      <div className="flex-1 bg-transparent overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default Window;