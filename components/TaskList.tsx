import React, { useState } from 'react';
import { Task } from '../types';
import { Plus, Search, Check, Trash2, ArrowUpDown, AlertCircle, Clock } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onAddTask: (title: string, project: string, priority: 'low' | 'medium' | 'high', reminder?: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onAddTask, onToggleTask, onDeleteTask }) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'project'>('date');
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskProject, setNewTaskProject] = useState('General');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskReminder, setNewTaskReminder] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle, newTaskProject, newTaskPriority, newTaskReminder || undefined);
    setNewTaskTitle('');
    setNewTaskReminder('');
    setNewTaskPriority('medium');
  };

  const getPriorityColor = (p?: string) => {
    switch (p) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400';
      case 'low': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const filteredTasks = tasks
    .filter(t => (filter === 'active' ? !t.completed : filter === 'completed' ? t.completed : true))
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const pMap = { high: 3, medium: 2, low: 1 };
        return (pMap[b.priority || 'medium'] || 0) - (pMap[a.priority || 'medium'] || 0);
      }
      if (sortBy === 'project') return a.project.localeCompare(b.project);
      if (!a.reminder && !b.reminder) return 0;
      if (!a.reminder) return 1;
      if (!b.reminder) return -1;
      return new Date(a.reminder).getTime() - new Date(b.reminder).getTime();
    });

  return (
    <div className="h-full flex flex-col p-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-3 flex-shrink-0">
        <div className="flex items-center gap-2 p-1 rounded-lg bg-gray-100 dark:bg-slate-700/50">
          {['all', 'active', 'completed'].map((f) => (
            <button key={f} onClick={() => setFilter(f as any)}
              className={`px-3 py-1 text-sm font-medium capitalize rounded-md transition-colors ${filter === f ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:bg-white/50'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 p-2">
            <option value="date">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="project">Sort by Project</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700/50 shadow-inner overflow-hidden flex flex-col">
        {/* Task List */}
        <div className="overflow-y-auto flex-1 p-2">
          {filteredTasks.length > 0 ? (
            <div className="space-y-1">
              {filteredTasks.map(task => (
                <div key={task.id} className="group flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                  <button onClick={() => onToggleTask(task.id)} className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 dark:border-gray-500 hover:border-indigo-500'}`}>
                    {task.completed && <Check size={12} className="text-white" />}
                  </button>
                  <div className="flex-1 min-w-0" onClick={() => onToggleTask(task.id)}>
                    <div className="flex items-center gap-2">
                      <span className={`truncate text-sm font-medium ${task.completed ? 'text-gray-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}>{task.title}</span>
                      {task.priority && <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${getPriorityColor(task.priority)}`}>{task.priority}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span>{task.project}</span>
                      {task.reminder && <span className={`flex items-center gap-1 ${new Date(task.reminder) < new Date() && !task.completed ? 'text-red-500 font-bold' : ''}`}><AlertCircle size={12} /> {new Date(task.reminder).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <button onClick={() => onDeleteTask(task.id)} className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-8">
              <Check size={48} className="mb-4 opacity-20" />
              <p className="font-medium">All clear!</p>
            </div>
          )}
        </div>
        {/* Add Task Form */}
        <div className="p-2 border-t border-gray-200 dark:border-slate-700/50 bg-gray-50 dark:bg-slate-900/50">
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Plus size={18} className="text-gray-400 flex-shrink-0 ml-2" />
              <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Add a new task..." className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 dark:text-white p-2 text-sm" />
              <button type="submit" disabled={!newTaskTitle.trim()} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">Add</button>
            </div>
            <div className="flex items-center gap-2 pl-8">
              <select value={newTaskProject} onChange={(e) => setNewTaskProject(e.target.value)} className="bg-transparent border-0 text-xs text-gray-500 focus:ring-0"><option>General</option><option>University</option><option>Work</option><option>Personal</option></select>
              <select value={newTaskPriority} onChange={(e) => setNewTaskPriority(e.target.value as any)} className="bg-transparent border-0 text-xs text-gray-500 focus:ring-0"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select>
              <div className="relative"><Clock size={12} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500" /><input type="datetime-local" value={newTaskReminder} onChange={(e) => setNewTaskReminder(e.target.value)} className="bg-transparent border-0 text-xs text-gray-500 pl-4 focus:ring-0" /></div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskList;
