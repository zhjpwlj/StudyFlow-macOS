import React, { useState, useEffect, useMemo } from 'react';
import MenuBar from './components/MenuBar.tsx';
import Dock from './components/Dock.tsx';
import Window from './components/Window.tsx';
import Dashboard from './components/Dashboard.tsx';
import TaskList from './components/TaskList.tsx';
import FocusTimer from './components/FocusTimer.tsx';
import TimeTracker from './components/TimeTracker.tsx';
import Journal from './components/Journal.tsx';
import StudyRoom from './components/StudyRoom.tsx';
import ChatBot from './components/ChatBot.tsx';
import Settings from './components/Settings.tsx';
import ConfirmationModal from './components/ConfirmationModal.tsx';
import { AppModule, Task, TimeEntry, JournalEntry, ActiveTimer, WindowConfig } from './types.ts';
import { usePersistentState } from './hooks/usePersistentState.ts';
import { wallpapers, accentColors } from './config/theme.ts';

const App: React.FC = () => {
  // --- UI State ---
  const [isDarkMode, setIsDarkMode] = usePersistentState<boolean>('focusflow-theme-dark', () => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [accentColor, setAccentColor] = usePersistentState<string>('focusflow-theme-accent', accentColors[0].hex);
  const [wallpaper, setWallpaper] = usePersistentState<string>('focusflow-theme-wallpaper', wallpapers[0].id);
  const [windows, setWindows] = usePersistentState<WindowConfig[]>('focusflow-windows', []);
  const [nextZIndex, setNextZIndex] = usePersistentState<number>('focusflow-zIndex', 10);
  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);

  // --- App Data State ---
  const [tasks, setTasks] = usePersistentState<Task[]>('focusflow-tasks', [
    { id: '1', title: 'Complete Calculus Assignment', completed: false, project: 'University', priority: 'high', reminder: new Date(Date.now() + 86400000).toISOString() },
    { id: '2', title: 'Review History Notes', completed: true, project: 'University', priority: 'medium' },
    { id: '3', title: 'Buy Groceries', completed: false, project: 'Personal', priority: 'low' },
    { id: '4', title: 'Prepare Presentation Slides', completed: false, project: 'Work', priority: 'high', reminder: new Date(Date.now() + 172800000).toISOString() },
  ]);
  const [timeEntries, setTimeEntries] = usePersistentState<TimeEntry[]>('focusflow-timeEntries', []);
  const [activeTimer, setActiveTimer] = usePersistentState<ActiveTimer | null>('focusflow-activeTimer', null);
  const [journalEntries, setJournalEntries] = usePersistentState<JournalEntry[]>('focusflow-journalEntries', []);

  // --- Effects for Themeing ---
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const root = document.documentElement;
    const selectedAccent = accentColors.find(c => c.hex === accentColor) || accentColors[0];
    root.style.setProperty('--accent-color', selectedAccent.hex);
    root.style.setProperty('--accent-color-hover', selectedAccent.hoverHex);
  }, [accentColor]);

  const activeWindowId = useMemo(() => {
    if (windows.length === 0) return null;
    const activeWindows = windows.filter(w => !w.isMinimized);
    if (activeWindows.length === 0) return null;
    return activeWindows.reduce((a, b) => a.zIndex > b.zIndex ? a : b).id;
  }, [windows]);

  // --- Window Management Logic ---

  const constrainWindowPosition = (config: WindowConfig): { x: number, y: number } => {
    const MENUBAR_HEIGHT = 28;
    const DOCK_AREA_HEIGHT = 64; 
    const HEADER_HEIGHT = 36;
    const VISIBLE_EDGE_THRESHOLD = 80;

    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight - MENUBAR_HEIGHT - DOCK_AREA_HEIGHT;

    let newX = config.x;
    let newY = config.y;

    newY = Math.max(0, newY);
    newY = Math.min(availableHeight - HEADER_HEIGHT, newY); 
    newX = Math.max(-config.width + VISIBLE_EDGE_THRESHOLD, newX);
    newX = Math.min(availableWidth - VISIBLE_EDGE_THRESHOLD, newX);

    return { x: newX, y: newY };
  };

  const openWindow = (appId: AppModule) => {
    const existingWindow = windows.find(w => w.id === appId);
    if (existingWindow) {
      focusWindow(appId);
      if (existingWindow.isMinimized) {
          setWindows(windows.map(w => w.id === appId ? { ...w, isMinimized: false, zIndex: nextZIndex + 1 } : w));
          setNextZIndex(nextZIndex + 1);
      }
      return;
    }
    
    const baseConfig: WindowConfig = {
      id: appId,
      x: Math.random() * 200 + 50,
      y: Math.random() * 100 + 50,
      width: appId === AppModule.SETTINGS ? 700 : 800,
      height: appId === AppModule.SETTINGS ? 500 : 600,
      zIndex: nextZIndex + 1,
      isMinimized: false,
      isMaximized: false,
    };
    const constrainedPos = constrainWindowPosition(baseConfig);
    const newWindow: WindowConfig = { ...baseConfig, ...constrainedPos };

    setWindows([...windows, newWindow]);
    setNextZIndex(nextZIndex + 1);
  };
  
  const closeWindow = (appId: AppModule) => {
    setWindows(prev => prev.map(w => w.id === appId ? { ...w, isClosing: true } : w));
    setTimeout(() => {
      setWindows(prev => prev.filter(w => w.id !== appId));
    }, 300);
  };

  const minimizeWindow = (appId: AppModule) => setWindows(windows.map(w => w.id === appId ? { ...w, isMinimized: true } : w));
  
  const toggleMaximizeWindow = (appId: AppModule) => {
    setWindows(windows.map(w => {
      if (w.id === appId) {
        if (w.isMaximized) {
          const restoredState = { ...w, isMaximized: false, ...w.preMaximizeState, preMaximizeState: undefined } as WindowConfig;
          const constrainedPos = constrainWindowPosition(restoredState);
          return { ...restoredState, ...constrainedPos };
        } else {
          return { ...w, isMaximized: true, preMaximizeState: { x: w.x, y: w.y, width: w.width, height: w.height }, x: 0, y: 0, width: window.innerWidth, height: window.innerHeight - 28 - 64 };
        }
      }
      return w;
    }));
  };

  const focusWindow = (appId: AppModule) => {
    const window = windows.find(w => w.id === appId);
    if(window && window.zIndex < nextZIndex) {
        setWindows(windows.map(w => w.id === appId ? { ...w, zIndex: nextZIndex + 1, isMinimized: false } : w));
        setNextZIndex(nextZIndex + 1);
    }
  };

  const updateWindow = (appId: AppModule, updates: Partial<WindowConfig>) => {
    setWindows(windows.map(w => {
      if (w.id === appId) {
        const potentialUpdate = { ...w, ...updates } as WindowConfig;
        const constrainedPos = constrainWindowPosition(potentialUpdate);
        return { ...potentialUpdate, ...constrainedPos };
      }
      return w;
    }));
  };

  const closeActiveWindow = () => activeWindowId && closeWindow(activeWindowId);
  const minimizeActiveWindow = () => activeWindowId && minimizeWindow(activeWindowId);
  const toggleMaximizeActiveWindow = () => activeWindowId && toggleMaximizeWindow(activeWindowId);
  const closeAllWindows = () => {
    setWindows(prev => prev.map(w => ({ ...w, isClosing: true })));
    setTimeout(() => setWindows([]), 300);
  };

  // --- Data Handlers ---
  const handleAddTask = (title: string, project: string, priority: 'low' | 'medium' | 'high' = 'medium', reminder?: string) => {
    const newTask: Task = { id: Date.now().toString(), title, completed: false, project: project || 'General', priority, reminder };
    setTasks(prev => [newTask, ...prev]);
    openWindow(AppModule.TASKS);
  };
  const handleToggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const handleDeleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));
  const handleStartTimer = (description: string, project: string) => setActiveTimer({ startTime: Date.now(), description, project });
  const handleStopTimer = () => {
    if (!activeTimer) return;
    const endTime = Date.now();
    const duration = Math.floor((endTime - activeTimer.startTime) / 1000);
    const newEntry: TimeEntry = { id: Date.now().toString(), description: activeTimer.description, startTime: activeTimer.startTime, endTime, duration, project: activeTimer.project };
    setTimeEntries(prev => [newEntry, ...prev]);
    setActiveTimer(null);
  };
  const handleAddJournalEntry = (entry: Omit<JournalEntry, 'id' | 'date'>) => {
    const newEntry: JournalEntry = { id: Date.now().toString(), date: new Date().toISOString(), ...entry };
    setJournalEntries(prev => [newEntry, ...prev]);
  };
  
  const handleExportData = () => {
    const data = { tasks, timeEntries, journalEntries, settings: { isDarkMode, accentColor, wallpaper } };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'focusflow_backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleWipeData = () => {
    Object.keys(localStorage).filter(key => key.startsWith('focusflow-')).forEach(key => localStorage.removeItem(key));
    window.location.reload();
  };

  // --- Render ---
  const renderAppContent = (appId: AppModule) => {
    switch (appId) {
      case AppModule.DASHBOARD: return <Dashboard tasks={tasks} timeEntries={timeEntries} onToggleTask={handleToggleTask}/>;
      case AppModule.TASKS: return <TaskList tasks={tasks} onAddTask={handleAddTask} onToggleTask={handleToggleTask} onDeleteTask={handleDeleteTask} />;
      case AppModule.POMODORO: return <FocusTimer />;
      case AppModule.TIMER: return <TimeTracker timeEntries={timeEntries} activeTimer={activeTimer} onStartTimer={handleStartTimer} onStopTimer={handleStopTimer} />;
      case AppModule.JOURNAL: return <Journal entries={journalEntries} onAddEntry={handleAddJournalEntry} />;
      case AppModule.SOCIAL: return <StudyRoom />;
      case AppModule.CHAT: return <ChatBot isWindowed={true} />;
      case AppModule.SETTINGS: return <Settings isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} accentColor={accentColor} onSetAccentColor={setAccentColor} wallpaper={wallpaper} onSetWallpaper={setWallpaper} onExportData={handleExportData} onWipeData={() => setIsWipeModalOpen(true)} />;
      default: return null;
    }
  };
  
  const selectedWallpaper = wallpapers.find(w => w.id === wallpaper) || wallpapers[0];
  const wallpaperUrl = isDarkMode ? selectedWallpaper.darkUrl : selectedWallpaper.lightUrl;

  return (
    <div className={`h-full w-full overflow-hidden font-sans ${isDarkMode ? 'dark' : ''}`}>
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-all duration-500 ease-in-out"
        style={{ backgroundImage: `url(${wallpaperUrl})` }}
      />
      
      <MenuBar 
        isDarkMode={isDarkMode} 
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onNewTask={() => openWindow(AppModule.TASKS)}
        onOpenPreferences={() => openWindow(AppModule.SETTINGS)}
        onCloseWindow={closeActiveWindow}
        onMinimizeWindow={minimizeActiveWindow}
        onToggleMaximize={toggleMaximizeActiveWindow}
        onCloseAll={closeAllWindows}
        windows={windows}
        activeWindowId={activeWindowId}
        onFocusWindow={focusWindow}
      />
      
      <main className="absolute inset-0 top-[var(--menubar-height)] bottom-[calc(var(--dock-height)+8px)]">
        {windows.map(config => (
          <Window 
            key={config.id} 
            config={config} 
            onClose={() => closeWindow(config.id)} 
            onMinimize={() => minimizeWindow(config.id)}
            onToggleMaximize={() => toggleMaximizeWindow(config.id)}
            onFocus={() => focusWindow(config.id)}
            onUpdate={(updates) => updateWindow(config.id, updates)}
          >
            {renderAppContent(config.id)}
          </Window>
        ))}
      </main>

      <Dock openWindows={windows} onLaunch={openWindow} onFocus={focusWindow}/>

      <ConfirmationModal 
        isOpen={isWipeModalOpen}
        onClose={() => setIsWipeModalOpen(false)}
        onConfirm={() => {
          setIsWipeModalOpen(false);
          handleWipeData();
        }}
        title="Reset All Data"
        message="Are you sure you want to delete all your data? This action is irreversible and will reset the application to its default state."
        confirmText="Yes, Reset Everything"
      />
    </div>
  );
};

export default App;