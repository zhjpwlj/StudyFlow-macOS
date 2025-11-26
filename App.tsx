import React, { useState, useEffect, useMemo } from 'react';
import MenuBar from './components/MenuBar';
import Dock from './components/Dock';
import Window from './components/Window';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import FocusTimer from './components/FocusTimer';
import TimeTracker from './components/TimeTracker';
import Journal from './components/Journal';
import StudyRoom from './components/StudyRoom';
import ChatBot from './components/ChatBot';
import { AppModule, Task, TimeEntry, JournalEntry, ActiveTimer, WindowConfig } from './types';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [windows, setWindows] = useState<WindowConfig[]>([]);
  const [nextZIndex, setNextZIndex] = useState(10);

  // --- State Management for App Data ---
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Complete Calculus Assignment', completed: false, project: 'University', priority: 'high', reminder: new Date(Date.now() + 86400000).toISOString() },
    { id: '2', title: 'Review History Notes', completed: true, project: 'University', priority: 'medium' },
    { id: '3', title: 'Buy Groceries', completed: false, project: 'Personal', priority: 'low' },
    { id: '4', title: 'Prepare Presentation Slides', completed: false, project: 'Work', priority: 'high', reminder: new Date(Date.now() + 172800000).toISOString() },
  ]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // --- Effects ---
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const activeWindowId = useMemo(() => {
    if (windows.length === 0) return null;
    const activeWindows = windows.filter(w => !w.isMinimized);
    if (activeWindows.length === 0) return null;
    return activeWindows.reduce((a, b) => a.zIndex > b.zIndex ? a : b).id;
  }, [windows]);

  // --- Window Management Logic ---

  const constrainWindowPosition = (config: WindowConfig): { x: number, y: number } => {
    const MENUBAR_HEIGHT = 28;
    const DOCK_AREA_HEIGHT = 64; // 56px dock + 8px bottom padding for main container
    const HEADER_HEIGHT = 36; // From Window.tsx h-9
    const VISIBLE_EDGE_THRESHOLD = 80; // Min pixels of the window to keep visible on horizontal edges

    const availableWidth = window.innerWidth;
    // This is the height of the <main> element where windows are rendered
    const availableHeight = window.innerHeight - MENUBAR_HEIGHT - DOCK_AREA_HEIGHT;

    let newX = config.x;
    let newY = config.y;

    // Constrain Y (vertical): Keep header visible within the main area
    newY = Math.max(0, newY); // Don't go above the main area
    newY = Math.min(availableHeight - HEADER_HEIGHT, newY); // Don't let header go under the dock
    
    // Constrain X (horizontal): Keep a portion of the window visible
    newX = Math.max(-config.width + VISIBLE_EDGE_THRESHOLD, newX); // Don't go too far left
    newX = Math.min(availableWidth - VISIBLE_EDGE_THRESHOLD, newX); // Don't go too far right

    return { x: newX, y: newY };
  };

  // --- Window Management Handlers ---
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
      width: 800,
      height: 600,
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
    }, 300); // Match animation duration
  };

  const minimizeWindow = (appId: AppModule) => setWindows(windows.map(w => w.id === appId ? { ...w, isMinimized: true } : w));
  
  const toggleMaximizeWindow = (appId: AppModule) => {
    setWindows(windows.map(w => {
      if (w.id === appId) {
        if (w.isMaximized) {
          // Restore
          const restoredState = {
            ...w,
            isMaximized: false,
            ...w.preMaximizeState, // apply stored dimensions
            preMaximizeState: undefined,
          } as WindowConfig;
          const constrainedPos = constrainWindowPosition(restoredState);
          return { ...restoredState, ...constrainedPos };

        } else {
          // Maximize
          return {
            ...w,
            isMaximized: true,
            preMaximizeState: { x: w.x, y: w.y, width: w.width, height: w.height },
            x: 0,
            y: 0,
            width: window.innerWidth,
            height: window.innerHeight - 28 - 64, // menubar and dock allowance
          };
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
      default: return null;
    }
  };

  return (
    <div className={`h-full w-full overflow-hidden font-sans ${isDarkMode ? 'dark' : ''}`}>
      <MenuBar 
        isDarkMode={isDarkMode} 
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onNewTask={() => openWindow(AppModule.TASKS)}
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
    </div>
  );
};

export default App;