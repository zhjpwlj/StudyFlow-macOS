import React from 'react';
import { LayoutDashboard, CheckSquare, Timer, Clock, BookOpen, Users, Settings, BrainCircuit } from 'lucide-react';
import { AppModule, WindowConfig } from '../types.ts';

interface DockProps {
  openWindows: WindowConfig[];
  onLaunch: (appId: AppModule) => void;
  onFocus: (appId: AppModule) => void;
}

const appIcons = {
  [AppModule.DASHBOARD]: LayoutDashboard,
  [AppModule.TASKS]: CheckSquare,
  [AppModule.TIMER]: Timer,
  [AppModule.POMODORO]: Clock,
  [AppModule.JOURNAL]: BookOpen,
  [AppModule.SOCIAL]: Users,
  [AppModule.CHAT]: BrainCircuit,
  [AppModule.SETTINGS]: Settings,
};

const appNames = {
  [AppModule.DASHBOARD]: 'Dashboard',
  [AppModule.TASKS]: 'Tasks',
  [AppModule.TIMER]: 'Time Tracker',
  [AppModule.POMODORO]: 'Focus Timer',
  [AppModule.JOURNAL]: 'Journal',
  [AppModule.SOCIAL]: 'Study Room',
  [AppModule.CHAT]: 'FocusFlow AI',
  [AppModule.SETTINGS]: 'Settings',
}

const Dock: React.FC<DockProps> = ({ openWindows, onLaunch, onFocus }) => {
  const isOpen = (appId: AppModule) => openWindows.some(w => w.id === appId);

  const handleClick = (appId: AppModule) => {
    if (isOpen(appId)) {
      onFocus(appId);
    }
    onLaunch(appId);
  };
  
  return (
    <footer className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-end justify-center h-[var(--dock-height)] space-x-2 bg-white/30 dark:bg-black/30 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shadow-dock">
        {Object.values(AppModule).map(appId => {
          const Icon = appIcons[appId];
          const name = appNames[appId];
          if (!Icon) return null;
          
          return (
            <div key={appId} className="relative group flex flex-col items-center">
                <div className="absolute -top-8 hidden group-hover:block bg-slate-800 text-white px-2 py-1 rounded-md text-xs">
                    {name}
                </div>
                <button
                    onClick={() => handleClick(appId)}
                    className="w-12 h-12 flex items-center justify-center bg-white/50 dark:bg-black/20 rounded-lg transition-all duration-200 group-hover:-translate-y-2"
                >
                    <Icon className="text-slate-800 dark:text-white" size={28} />
                </button>
                {isOpen(appId) && (
                    <div className="w-1.5 h-1.5 bg-slate-600 dark:bg-slate-300 rounded-full mt-1.5"></div>
                )}
            </div>
          );
        })}
      </div>
    </footer>
  );
};

export default Dock;