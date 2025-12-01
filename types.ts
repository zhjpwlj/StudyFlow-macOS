

export enum AppModule {
  DASHBOARD = 'DASHBOARD',
  TASKS = 'TASKS',
  TIMER = 'TIMER',
  POMODORO = 'POMODORO',
  JOURNAL = 'JOURNAL',
  SOCIAL = 'SOCIAL',
  CHAT = 'CHAT',
  SETTINGS = 'SETTINGS',
  CALCULATOR = 'CALCULATOR',
  NOTES = 'NOTES',
  WEATHER = 'WEATHER',
  CLOCK = 'CLOCK',
  CALENDAR = 'CALENDAR',
  GOALS = 'GOALS',
  MUSIC = 'MUSIC'
}

export interface WindowConfig {
  id: AppModule;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  preMaximizeState?: { x: number; y: number; width: number; height: number; };
  isClosing?: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  project: string;
  dueDate?: string; 
  reminder?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface TimeEntry {
  id: string;
  description: string;
  startTime: number;
  endTime: number | null;
  duration: number; // in seconds
  project: string;
}

export interface ActiveTimer {
  startTime: number;
  description: string;
  project: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  title: string;
  moodRatings?: Record<string, number>;
  mood: 'happy' | 'neutral' | 'focused' | 'tired';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface Note {
  id: string;
  content: string;
  createdAt: number;
}

export interface Event {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  color: string;
}

export interface Goal {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  completed: boolean;
}