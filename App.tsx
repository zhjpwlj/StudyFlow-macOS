
import React, { useState, useEffect } from 'react';
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
    
    const newWindow: WindowConfig = {
      id: appId,
      x: Math.random() * 200 + 50,
      y: Math.random() * 100 + 50,
      width: 800,
      height: 600,
      zIndex: nextZIndex + 1,
      isMinimized: false,
      isMaximized: false,
    };
    setWindows([...windows, newWindow]);
    setNextZIndex(nextZIndex + 1);
  };
  
  const closeWindow = (appId: AppModule) => setWindows(windows.filter(w => w.id !== appId));
  const minimizeWindow = (appId: AppModule) => setWindows(windows.map(w => w.id === appId ? { ...w, isMinimized: true } : w));
  
  const toggleMaximizeWindow = (appId: AppModule) => {
    setWindows(windows.map(w => {
      if (w.id === appId) {
        if (w.isMaximized) {
          // Restore
          return {
            ...w,
            isMaximized: false,
            ...(w.preMaximizeState || {}), // apply stored dimensions
            preMaximizeState: undefined,
          };
        } else {
          // Maximize
          return {
            ...w,
            isMaximized: true,
            preMaximizeState: { x: w.x, y: w.y, width: w.width, height: w.height },
            x: 0,
            y: 0,
            width: window.innerWidth, // Adjust if main area is not full screen
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
    setWindows(windows.map(w => w.id === appId ? { ...w, ...updates } : w));
  };

  // --- Data Handlers ---
  const handleAddTask = (title: string, project: string, priority: 'low' | 'medium' | 'high' = 'medium', reminder?: string) => {
    const newTask: Task = { id: Date.now().toString(), title, completed: false, project: project || 'General', priority, reminder };
    setTasks(prev => [newTask, ...prev]);
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
      <MenuBar isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} />
      
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