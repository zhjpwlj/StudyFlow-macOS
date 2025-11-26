
export enum AppModule {
  DASHBOARD = 'DASHBOARD',
  TASKS = 'TASKS',
  TIMER = 'TIMER',
  POMODORO = 'POMODORO',
  JOURNAL = 'JOURNAL',
  SOCIAL = 'SOCIAL',
  CHAT = 'CHAT'
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
  mood: 'happy' | 'neutral' | 'focused' | 'tired';
  title: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}