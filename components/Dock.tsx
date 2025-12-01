import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, CheckSquare, Timer, Clock as PomodoroIcon, BookOpen, Users, Settings, BrainCircuit, Calculator, NotebookText, CloudSun, AlarmClock, Calendar as CalendarIcon, Target, Music as MusicIcon, Grid, HeartPulse } from 'lucide-react';
import { AppModule, WindowConfig } from '../types';

interface DockProps {
  openWindows: WindowConfig[];
  onLaunch: (appId: AppModule) => void;
  onFocus: (appId: AppModule) => void;
}

const appIcons: Record<AppModule, React.ElementType> = {
  [AppModule.DASHBOARD]: LayoutDashboard,
  [AppModule.TASKS]: CheckSquare,
  [AppModule.TIMER]: Timer,
  [AppModule.POMODORO]: PomodoroIcon,
  [AppModule.JOURNAL]: BookOpen,
  [AppModule.SOCIAL]: Users,
  [AppModule.CHAT]: BrainCircuit,
  [AppModule.SETTINGS]: Settings,
  [AppModule.CALCULATOR]: Calculator,
  [AppModule.NOTES]: NotebookText,
  [AppModule.WEATHER]: CloudSun,
  [AppModule.CLOCK]: AlarmClock,
  [AppModule.CALENDAR]: CalendarIcon,
  [AppModule.GOALS]: Target,
  [AppModule.MUSIC]: MusicIcon,
};

const appNames: Record<AppModule, string> = {
  [AppModule.DASHBOARD]: 'Dashboard',
  [AppModule.TASKS]: 'Tasks',
  [AppModule.TIMER]: 'Time Tracker',
  [AppModule.POMODORO]: 'Focus Timer',
  [AppModule.JOURNAL]: 'Journal',
  [AppModule.SOCIAL]: 'Study Room',
  [AppModule.CHAT]: 'FocusFlow AI',
  [AppModule.SETTINGS]: 'Settings',
  [AppModule.CALCULATOR]: 'Calculator',
  [AppModule.NOTES]: 'Notes',
  [AppModule.WEATHER]: 'Weather',
  [AppModule.CLOCK]: 'Clock',
  [AppModule.CALENDAR]: 'Calendar',
  [AppModule.GOALS]: 'Goals',
  [AppModule.MUSIC]: 'Music',
};

type DockFolder = {
  type: 'folder';
  name: string;
  icon: React.ElementType;
  apps: AppModule[];
};

type DockItem = AppModule | DockFolder | 'divider';

const dockItems: DockItem[] = [
  AppModule.DASHBOARD,
  AppModule.TASKS,
  AppModule.CHAT,
  'divider',
  {
    type: 'folder',
    name: 'Utilities',
    icon: Grid,
    apps: [AppModule.CALCULATOR, AppModule.CLOCK, AppModule.NOTES, AppModule.WEATHER, AppModule.CALENDAR],
  },
  {
    type: 'folder',
    name: 'Lifestyle',
    icon: HeartPulse,
    apps: [AppModule.TIMER, AppModule.POMODORO, AppModule.JOURNAL, AppModule.GOALS, AppModule.MUSIC, AppModule.SOCIAL],
  },
  'divider',
  AppModule.SETTINGS,
];


const Dock: React.FC<DockProps> = ({ openWindows, onLaunch, onFocus }) => {
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const dockRef = useRef<HTMLElement>(null);
  
  const isOpen = (appId: AppModule) => openWindows.some(w => w.id === appId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dockRef.current && !dockRef.current.contains(event.target as Node)) {
        setOpenFolder(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <footer ref={dockRef} className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-end justify-center h-[var(--dock-height)] space-x-2 bg-white/30 dark:bg-black/30 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shadow-dock">
        {dockItems.map((item, index) => {
          if (item === 'divider') {
            return <div key={`divider-${index}`} className="w-px h-12 bg-white/20 mx-1 self-center"></div>;
          } else if (typeof item === 'object' && item.type === 'folder') {
            const folder = item;
            const isFolderActive = folder.apps.some(appId => isOpen(appId));
            return (
              <div key={folder.name} className="relative group flex flex-col items-center">
                {openFolder === folder.name && (
                  <div className="absolute bottom-full mb-3 w-64 bg-white/30 dark:bg-black/30 backdrop-blur-xl p-3 rounded-xl border border-white/20 shadow-dock grid grid-cols-4 gap-3 animate-fade-in">
                    {folder.apps.map(appId => {
                      const Icon = appIcons[appId];
                      const name = appNames[appId];
                      return (
                        <button
                          key={appId}
                          onClick={() => { onLaunch(appId); setOpenFolder(null); }}
                          className="flex flex-col items-center justify-center gap-1.5 group/app"
                        >
                          <div className="w-12 h-12 flex items-center justify-center bg-white/50 dark:bg-black/20 rounded-lg transition-all duration-200 group-hover/app:scale-110">
                            <Icon className="text-slate-800 dark:text-white" size={28} />
                          </div>
                          <span className="text-[10px] text-slate-800 dark:text-white truncate w-full">{name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="absolute -top-8 hidden group-hover:block bg-slate-800 text-white px-2 py-1 rounded-md text-xs">
                    {folder.name}
                </div>
                <button
                  onClick={() => setOpenFolder(openFolder === folder.name ? null : folder.name)}
                  className="w-12 h-12 flex items-center justify-center bg-white/50 dark:bg-black/20 rounded-lg transition-all duration-200 group-hover:-translate-y-2 relative"
                >
                  <folder.icon className="text-slate-800 dark:text-white" size={28} />
                </button>
                {isFolderActive && (
                  <div className="w-1.5 h-1.5 bg-slate-600 dark:bg-slate-300 rounded-full mt-1.5"></div>
                )}
              </div>
            );
          } else {
            // FIX: Refactored to an if-else structure to ensure TypeScript correctly narrows `item` to `AppModule`.
            // This resolves type errors where `item` (previously inferred as `DockItem`) was used incorrectly.
            const appId = item;
            const Icon = appIcons[appId];
            const name = appNames[appId];
            if (!Icon) return null;

            const handleClick = () => {
              if (isOpen(appId)) onFocus(appId);
              onLaunch(appId);
            };

            return (
              <div key={appId} className="relative group flex flex-col items-center">
                  <div className="absolute -top-8 hidden group-hover:block bg-slate-800 text-white px-2 py-1 rounded-md text-xs">
                      {name}
                  </div>
                  <button
                      onClick={handleClick}
                      className="w-12 h-12 flex items-center justify-center bg-white/50 dark:bg-black/20 rounded-lg transition-all duration-200 group-hover:-translate-y-2"
                  >
                      <Icon className="text-slate-800 dark:text-white" size={28} />
                  </button>
                  {isOpen(appId) && (
                      <div className="w-1.5 h-1.5 bg-slate-600 dark:bg-slate-300 rounded-full mt-1.5"></div>
                  )}
              </div>
            );
          }
        })}
      </div>
    </footer>
  );
};

export default Dock;
