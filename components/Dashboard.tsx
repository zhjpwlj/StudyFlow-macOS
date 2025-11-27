import React from 'react';
import { Task, TimeEntry } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, CheckCircle2, Flame, Calendar } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  timeEntries: TimeEntry[];
  onToggleTask: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, timeEntries, onToggleTask }) => {
  const completedTasks = tasks.filter(t => t.completed).length;
  
  const totalDuration = timeEntries.reduce((acc, curr) => acc + curr.duration, 0);
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Initialize data for the last 7 days, ending with today
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - i);
      return {
          name: dayNames[date.getDay()],
          date: date.setHours(0, 0, 0, 0), // Use start of day for comparison
          hours: 0
      };
  }).reverse(); // Reverse to have today at the end

  // Aggregate time entries by day
  timeEntries.forEach(entry => {
      const entryDayStart = new Date(entry.startTime).setHours(0, 0, 0, 0);
      const dayData = weeklyData.find(d => d.date === entryDayStart);
      if (dayData) {
          dayData.hours += entry.duration / 3600; // seconds to hours
      }
  });

  const data = weeklyData.map(d => ({ name: d.name, hours: parseFloat(d.hours.toFixed(1)) }));
  const todayIndex = 6; // Today is always the last item in our reversed array

  const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; detail: React.ReactNode }> = ({ icon, title, value, detail }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">{title}</span>
        {icon}
      </div>
      <div className="text-xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="text-xs mt-1">{detail}</div>
    </div>
  );

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Good Morning, Alex</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Here's your productivity overview for today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><Clock size={16} className="text-blue-600 dark:text-blue-400" /></div>}
          title="Time Tracked" value={`${hours}h ${minutes}m`} detail={<span className="text-green-600 flex items-center gap-1 text-xs">+12%</span>} />
        <StatCard 
          icon={<div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg"><CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" /></div>}
          title="Tasks Done" value={`${completedTasks}/${tasks.length}`} detail={<div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full mt-2"><div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${tasks.length > 0 ? (completedTasks/tasks.length)*100 : 0}%` }}></div></div>} />
        <StatCard 
          icon={<div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg"><Flame size={16} className="text-orange-600 dark:text-orange-400" /></div>}
          title="Focus Streak" value="5 Days" detail={<span className="text-gray-500 text-xs">Keep it up!</span>} />
        <StatCard 
          icon={<div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg"><Calendar size={16} className="text-purple-600 dark:text-purple-400" /></div>}
          title="Upcoming Exam" value="Calculus II" detail={<span className="text-purple-600 font-medium text-xs">In 3 days</span>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50">
           <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Weekly Activity</h3>
           <div style={{ width: '100%', height: 250 }}>
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--tw-colors-gray-200)" className="dark:stroke-slate-700" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--tw-colors-slate-500)', fontSize: 12}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--tw-colors-slate-500)', fontSize: 12}} />
                 <Tooltip cursor={{fill: 'var(--tw-colors-gray-100)', className: 'dark:fill-slate-700/50'}} contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: 'var(--tw-colors-white)', color: 'var(--tw-colors-slate-800)' }} itemStyle={{ color: 'var(--tw-colors-slate-800)'}} labelStyle={{ fontWeight: 'bold' }} />
                 <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (<Cell key={`cell-${index}`} fill={index === todayIndex ? 'var(--accent-color)' : '#cbd5e1'} className={index === todayIndex ? '' : 'dark:fill-slate-600'} />))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50">
           <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Today's Priorities</h3>
           <div className="space-y-2">
             {tasks.slice(0, 4).map(task => (
               <button key={task.id} onClick={() => onToggleTask(task.id)} className="w-full text-left flex items-start gap-3 p-2 bg-gray-50 dark:bg-slate-900/30 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors group">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center mt-0.5 transition-colors flex-shrink-0 ${task.completed ? 'bg-[var(--accent-color)] border-[var(--accent-color)]' : 'border-gray-300 dark:border-gray-500 group-hover:border-[var(--accent-color)]'}`}>
                    {task.completed && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${task.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>{task.title}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 block">{task.project}</span>
                  </div>
               </button>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;