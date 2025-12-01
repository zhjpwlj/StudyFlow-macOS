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
import Settings from './components/Settings';
import ConfirmationModal from './components/ConfirmationModal';
import Calculator from './components/Calculator';
import Notes from './components/Notes';
import Weather from './components/Weather';
import Clock from './components/Clock';
import Calendar from './components/Calendar';
import Goals from './components/Goals';
import Music from './components/Music';
import { AppModule, Task, TimeEntry, JournalEntry, ActiveTimer, WindowConfig, Note, Event, Goal } from './types';
import { usePersistentState } from './hooks/usePersistentState';
import { wallpapers, accentColors } from './config/theme';

const App: React.FC = () => {
  // State definitions
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

  // Data States
  const [tasks, setTasks] = usePersistentState<Task[]>('focusflow-tasks', [
    { id: '1', title: 'Complete Calculus Assignment', completed: false, project: 'University', priority: 'high', reminder: new Date(Date.now() + 86400000).toISOString() },
    { id: '2', title: 'Review History Notes', completed: true, project: 'University', priority: 'medium' },
    { id: '3', title: 'Buy Groceries', completed: false, project: 'Personal', priority: 'low' },
    { id: '4', title: 'Prepare Presentation Slides', completed: false, project: 'Work', priority: 'high', reminder: new Date(Date.now() + 172800000).toISOString() },
  ]);
  const [timeEntries, setTimeEntries] = usePersistentState<TimeEntry[]>('focusflow-timeEntries', []);
  const [activeTimer, setActiveTimer] = usePersistentState<ActiveTimer | null>('focusflow-activeTimer', null);
  const [journalEntries, setJournalEntries] = usePersistentState<JournalEntry[]>('focusflow-journalEntries', []);
  const [notes, setNotes] = usePersistentState<Note[]>('focusflow-notes', []);
  const [events, setEvents] = usePersistentState<Event[]>('focusflow-events', []);
  const [goals, setGoals] = usePersistentState<Goal[]>('focusflow-goals', []);

  // Effect for Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Effect for Accent Color
  useEffect(() => {
    const root = document.documentElement;
    const selectedAccent = accentColors.find(c => c.hex === accentColor) || accentColors[0];
    root.style.setProperty('--accent-color', selectedAccent.hex);
    root.style.setProperty('--accent-color-hover', selectedAccent.hoverHex);
  }, [accentColor]);

  // Active Window Logic
  const activeWindowId = useMemo(() => {
    if (windows.length === 0) return null;
    const activeWindows = windows.filter(w => !w.isMinimized);
    if (activeWindows.length === 0) return null;
    return activeWindows.reduce((prev, current) => (prev.zIndex > current.zIndex ? prev : current)).id;
  }, [windows]);

  // Window Management Functions
  const handleLaunch = (id: AppModule) => {
    setWindows(prev => {
      const existing = prev.find(w => w.id === id);
      if (existing) {
        // If minimized, unminimize. Bring to front.
        return prev.map(w => w.id === id ? { ...w, isMinimized: false, zIndex: nextZIndex } : w);
      }
      // Open new window
      const width = id === AppModule.CALCULATOR ? 320 : id === AppModule.TIMER ? 400 : 800;
      const height = id === AppModule.CALCULATOR ? 450 : id === AppModule.TIMER ? 500 : 600;
      return [...prev, {
        id,
        x: 50 + (prev.length * 20),
        y: 50 + (prev.length * 20),
        width,
        height,
        zIndex: nextZIndex,
        isMinimized: false,
        isMaximized: false
      }];
    });
    setNextZIndex(prev => prev + 1);
  };

  const handleClose = (id: AppModule) => {
    setWindows(prev => prev.filter(w => w.id !== id));
  };

  const handleFocus = (id: AppModule) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, zIndex: nextZIndex } : w));
    setNextZIndex(prev => prev + 1);
  };

  const handleMinimize = (id: AppModule) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
  };

  const handleToggleMaximize = (id: AppModule) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      if (w.isMaximized) {
        // Restore
        return { ...w, isMaximized: false, x: w.preMaximizeState?.x || w.x, y: w.preMaximizeState?.y || w.y, width: w.preMaximizeState?.width || w.width, height: w.preMaximizeState?.height || w.height };
      } else {
        // Maximize
        return {
          ...w,
          isMaximized: true,
          preMaximizeState: { x: w.x, y: w.y, width: w.width, height: w.height }
        };
      }
    }));
    handleFocus(id);
  };

  const handleUpdateWindow = (id: AppModule, updates: Partial<WindowConfig>) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const handleCloseAll = () => setWindows([]);

  // Data Handlers
  const addTask = (title: string, project: string, priority: 'low' | 'medium' | 'high', reminder?: string) => {
    setTasks(prev => [...prev, { id: Date.now().toString(), title, completed: false, project, priority, reminder }]);
  };
  const toggleTask = (id: string) => setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const deleteTask = (id: string) => setTasks(prev => prev.filter(t => t.id !== id));

  const startTimer = (description: string, project: string) => setActiveTimer({ startTime: Date.now(), description, project });
  const stopTimer = () => {
    if (activeTimer) {
      const duration = Math.floor((Date.now() - activeTimer.startTime) / 1000);
      setTimeEntries(prev => [{ id: Date.now().toString(), description: activeTimer.description, project: activeTimer.project, startTime: activeTimer.startTime, endTime: Date.now(), duration }, ...prev]);
      setActiveTimer(null);
    }
  };

  const addJournalEntry = (entry: Omit<JournalEntry, 'id' | 'date'>) => {
    setJournalEntries(prev => [{ id: Date.now().toString(), date: new Date().toISOString(), ...entry }, ...prev]);
  };

  const addNote = () => setNotes(prev => [{ id: Date.now().toString(), content: '', createdAt: Date.now() }, ...prev]);
  const updateNote = (id: string, content: string) => setNotes(prev => prev.map(n => n.id === id ? { ...n, content } : n));
  const deleteNote = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));

  const addEvent = (event: Omit<Event, 'id'>) => setEvents(prev => [...prev, { id: Date.now().toString(), ...event }]);
  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  const addGoal = (goal: Omit<Goal, 'id'>) => setGoals(prev => [...prev, { id: Date.now().toString(), ...goal }]);
  const toggleGoal = (id: string) => setGoals(prev => prev.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  const deleteGoal = (id: string) => setGoals(prev => prev.filter(g => g.id !== id));

  const handleWipeData = () => {
    setTasks([]); setTimeEntries([]); setActiveTimer(null); setJournalEntries([]); setNotes([]); setEvents([]); setGoals([]);
    setWindows([]);
    localStorage.clear(); // Nuclear option
    window.location.reload();
  };

  const getWallpaperUrl = () => {
    const wp = wallpapers.find(w => w.id === wallpaper) || wallpapers[0];
    return isDarkMode ? wp.darkUrl : wp.lightUrl;
  };

  const renderApp = (id: AppModule) => {
    switch (id) {
      case AppModule.DASHBOARD: return <Dashboard tasks={tasks} timeEntries={timeEntries} onToggleTask={toggleTask} />;
      case AppModule.TASKS: return <TaskList tasks={tasks} onAddTask={addTask} onToggleTask={toggleTask} onDeleteTask={deleteTask} />;
      case AppModule.TIMER: return <TimeTracker timeEntries={timeEntries} activeTimer={activeTimer} onStartTimer={startTimer} onStopTimer={stopTimer} />;
      case AppModule.POMODORO: return <FocusTimer />;
      case AppModule.JOURNAL: return <Journal entries={journalEntries} onAddEntry={addJournalEntry} />;
      case AppModule.SOCIAL: return <StudyRoom />;
      case AppModule.CHAT: return <ChatBot isWindowed={true} />;
      case AppModule.SETTINGS: return <Settings isDarkMode={isDarkMode} onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} accentColor={accentColor} onSetAccentColor={setAccentColor} wallpaper={wallpaper} onSetWallpaper={setWallpaper} onExportData={() => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ tasks, timeEntries, journalEntries, notes, events, goals }));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "focusflow_backup.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      }} onWipeData={() => setIsWipeModalOpen(true)} />;
      case AppModule.CALCULATOR: return <Calculator />;
      case AppModule.NOTES: return <Notes notes={notes} onAddNote={addNote} onUpdateNote={updateNote} onDeleteNote={deleteNote} />;
      case AppModule.WEATHER: return <Weather />;
      case AppModule.CLOCK: return <Clock />;
      case AppModule.CALENDAR: return <Calendar events={events} onAddEvent={addEvent} onDeleteEvent={deleteEvent} />;
      case AppModule.GOALS: return <Goals goals={goals} onAddGoal={addGoal} onToggleGoal={toggleGoal} onDeleteGoal={deleteGoal} />;
      case AppModule.MUSIC: return <Music />;
      default: return <div className="p-4">App not found</div>;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-cover bg-center transition-all duration-500" style={{ backgroundImage: `url(${getWallpaperUrl()})` }}>
      {/* Menu Bar */}
      <MenuBar
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onNewTask={() => { handleLaunch(AppModule.TASKS); }}
        onOpenPreferences={() => handleLaunch(AppModule.SETTINGS)}
        onCloseWindow={() => activeWindowId && handleClose(activeWindowId)}
        onMinimizeWindow={() => activeWindowId && handleMinimize(activeWindowId)}
        onToggleMaximize={() => activeWindowId && handleToggleMaximize(activeWindowId)}
        onCloseAll={handleCloseAll}
        windows={windows}
        activeWindowId={activeWindowId}
        onFocusWindow={handleFocus}
      />

      {/* Windows Area */}
      <div className="absolute top-[var(--menubar-height)] bottom-[calc(var(--dock-height)+20px)] left-0 right-0 overflow-hidden pointer-events-none">
        {windows.map(window => (
          <Window
            key={window.id}
            config={window}
            onClose={() => handleClose(window.id)}
            onMinimize={() => handleMinimize(window.id)}
            onToggleMaximize={() => handleToggleMaximize(window.id)}
            onFocus={() => handleFocus(window.id)}
            onUpdate={(updates) => handleUpdateWindow(window.id, updates)}
          >
            {renderApp(window.id)}
          </Window>
        ))}
      </div>

      {/* Dock */}
      <Dock openWindows={windows} onLaunch={handleLaunch} onFocus={handleFocus} />

      {/* Modals */}
      <ConfirmationModal
        isOpen={isWipeModalOpen}
        onClose={() => setIsWipeModalOpen(false)}
        onConfirm={() => { handleWipeData(); setIsWipeModalOpen(false); }}
        title="Wipe All Data?"
        message="This action cannot be undone. All your tasks, settings, and journal entries will be permanently deleted."
        confirmText="Wipe Everything"
      />
    </div>
  );
};

export default App;