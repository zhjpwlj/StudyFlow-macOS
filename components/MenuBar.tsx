import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Wifi, Check } from 'lucide-react';
import { WindowConfig, AppModule } from '../types.ts';

interface MenuBarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onNewTask: () => void;
  onOpenPreferences: () => void;
  onCloseWindow: () => void;
  onMinimizeWindow: () => void;
  onToggleMaximize: () => void;
  onCloseAll: () => void;
  windows: WindowConfig[];
  activeWindowId: AppModule | null;
  onFocusWindow: (appId: AppModule) => void;
}

const getTitle = (id: AppModule) => {
  const titles: Record<AppModule, string> = {
    [AppModule.DASHBOARD]: 'Dashboard',
    [AppModule.TASKS]: 'Tasks',
    [AppModule.TIMER]: 'Time Tracker',
    [AppModule.POMODORO]: 'Focus Mode',
    [AppModule.JOURNAL]: 'Journal',
    [AppModule.SOCIAL]: 'Study Room',
    [AppModule.CHAT]: 'FocusFlow AI',
    [AppModule.SETTINGS]: 'Settings',
  };
  return titles[id] || 'Application';
};

const MenuItem: React.FC<{ onClick?: () => void, disabled?: boolean, children: React.ReactNode, shortcut?: string }> = ({ onClick, disabled, children, shortcut }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="w-full text-left px-3 py-1.5 flex justify-between items-center text-sm hover:bg-[var(--accent-color)] hover:text-white rounded disabled:opacity-50 disabled:bg-transparent disabled:text-inherit"
    >
        <span>{children}</span>
        {shortcut && <span className="text-xs opacity-60">{shortcut}</span>}
    </button>
);

const MenuBar: React.FC<MenuBarProps> = (props) => {
  const [time, setTime] = useState(new Date());
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
            setOpenMenu(null);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        clearInterval(timer);
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuClick = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };
  
  const handleItemClick = (action?: () => void) => {
      action?.();
      setOpenMenu(null);
  }

  const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  const formatDate = (date: Date) => date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  const { isDarkMode, onToggleDarkMode, onNewTask, onOpenPreferences, onCloseWindow, onMinimizeWindow, onToggleMaximize, onCloseAll, windows, activeWindowId, onFocusWindow } = props;
  const hasActiveWindow = !!activeWindowId;

  const menus = {
      'FocusFlow': [
          { label: 'About FocusFlow', disabled: true },
          'divider',
          { label: 'Preferences...', action: onOpenPreferences, shortcut: '⌘,' },
      ],
      'File': [
          { label: 'New Task...', action: onNewTask, shortcut: '⌘N' },
          { label: 'Close All Windows', action: onCloseAll, disabled: windows.length === 0, shortcut: '⌥⌘W' },
      ],
      'Edit': [ { label: 'Undo', disabled: true }, { label: 'Redo', disabled: true }, { label: 'Copy', disabled: true } ],
      'View': [
          { label: 'Toggle Dark Mode', action: onToggleDarkMode, shortcut: '⌘T' },
      ],
      'Window': [
          { label: 'Minimize', action: onMinimizeWindow, disabled: !hasActiveWindow, shortcut: '⌘M' },
          { label: 'Zoom', action: onToggleMaximize, disabled: !hasActiveWindow },
          { label: 'Close', action: onCloseWindow, disabled: !hasActiveWindow, shortcut: '⌘W' },
          'divider',
          ...windows.map(w => ({ label: getTitle(w.id), action: () => onFocusWindow(w.id), checked: w.id === activeWindowId })),
      ],
  };

  return (
    <header ref={menuRef} className="fixed top-0 left-0 right-0 h-[var(--menubar-height)] bg-white/30 dark:bg-black/30 backdrop-blur-lg shadow-sm z-50 flex items-center justify-between px-4 text-sm text-slate-900 dark:text-slate-100 select-none">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-[var(--accent-color)] rounded-md flex items-center justify-center text-white text-xs font-bold">F</div>
        {Object.entries(menus).map(([menuName, items]) => (
            <div key={menuName} className="relative">
                <button
                    onClick={() => handleMenuClick(menuName)}
                    className={`px-3 py-1 rounded transition-colors ${openMenu === menuName ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}
                >
                    <span className={menuName === 'FocusFlow' ? 'font-bold' : 'font-medium'}>{menuName}</span>
                </button>
                {openMenu === menuName && items.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-md shadow-lg p-1 border border-white/20 dark:border-black/20">
                        {items.map((item, index) => {
                            if (item === 'divider') return <hr key={index} className="my-1 border-t border-gray-500/20" />;
                            const { label, action, disabled, shortcut, checked } = item as any;
                            return (
                                <MenuItem key={label} onClick={() => handleItemClick(action)} disabled={disabled} shortcut={shortcut}>
                                    <span className="flex items-center gap-2">
                                        <span className="w-4">{checked && <Check size={14} />}</span>
                                        {label}
                                    </span>
                                </MenuItem>
                            );
                        })}
                    </div>
                )}
            </div>
        ))}
      </div>
      
      <div className="flex items-center gap-4">
        <Wifi size={16} />
        <button 
          onClick={onToggleDarkMode}
          className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div className="flex gap-2 font-medium">
            <span>{formatDate(time)}</span>
            <span>{formatTime(time)}</span>
        </div>
      </div>
    </header>
  );
};

export default MenuBar;