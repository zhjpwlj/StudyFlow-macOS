import React, { useState } from 'react';
import { Goal } from '../types';
import { Target, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';

interface GoalsProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
}

const Goals: React.FC<GoalsProps> = ({ goals, onAddGoal, onToggleGoal, onDeleteGoal }) => {
  const [newGoalTitle, setNewGoalTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    onAddGoal({
      title: newGoalTitle,
      date: new Date().toISOString().split('T')[0],
      completed: false
    });
    setNewGoalTitle('');
  };

  return (
    <div className="h-full flex flex-col p-4">
        <div className="flex items-center gap-2 mb-4 text-slate-900 dark:text-white">
            <Target size={24} className="text-[var(--accent-color)]"/>
            <h2 className="text-xl font-bold">My Goals</h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
            {goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                    <Target size={48} className="mb-2 opacity-20"/>
                    <p>No goals set yet.</p>
                </div>
            ) : (
                goals.map(goal => (
                    <div key={goal.id} className="group flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700/50">
                        <button onClick={() => onToggleGoal(goal.id)} className="text-[var(--accent-color)]">
                            {goal.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>
                        <span className={`flex-1 font-medium ${goal.completed ? 'line-through text-gray-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {goal.title}
                        </span>
                        <button onClick={() => onDeleteGoal(goal.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))
            )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input 
                type="text" 
                value={newGoalTitle} 
                onChange={e => setNewGoalTitle(e.target.value)} 
                placeholder="Add a new goal..." 
                className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            />
            <button type="submit" disabled={!newGoalTitle.trim()} className="bg-[var(--accent-color)] text-white p-2 rounded-lg hover:bg-[var(--accent-color-hover)] disabled:opacity-50">
                <Plus size={20} />
            </button>
        </form>
    </div>
  );
};

export default Goals;