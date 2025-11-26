import React, { useState, useEffect } from 'react';
import { Sun, Moon, Wifi } from 'lucide-react';

interface MenuBarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const MenuBar: React.FC<MenuBarProps> = ({ isDarkMode, onToggleDarkMode }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };
  
  const formatDate = (date: Date) => {
      return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-[var(--menubar-height)] bg-white/30 dark:bg-black/30 backdrop-blur-lg shadow-sm z-50 flex items-center justify-between px-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
      <div className="flex items-center gap-4">
        <div className="w-5 h-5 bg-indigo-600 rounded-md flex items-center justify-center text-white text-xs font-bold">
            F
        </div>
        <span className="font-bold">FocusFlow</span>
        <span className="opacity-70">File</span>
        <span className="opacity-70">Edit</span>
        <span className="opacity-70">View</span>
        <span className="opacity-70">Window</span>
        <span className="opacity-70">Help</span>
      </div>
      
      <div className="flex items-center gap-4">
        <Wifi size={16} />
        <button 
          onClick={onToggleDarkMode}
          className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-md transition-colors"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div className="flex gap-2">
            <span>{formatDate(time)}</span>
            <span>{formatTime(time)}</span>
        </div>
      </div>
    </header>
  );
};

export default MenuBar;
