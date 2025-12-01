import React, { useState, useMemo } from 'react';
import { Event } from '../types';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';

interface CalendarProps {
  events: Event[];
  onAddEvent: (event: Omit<Event, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
}

const eventColors = ['#4f46e5', '#10b981', '#f59e0b', '#e11d48'];

const Calendar: React.FC<CalendarProps> = ({ events, onAddEvent, onDeleteEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventColor, setNewEventColor] = useState(eventColors[0]);

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const days = useMemo(() => {
    const dayArray = [];
    for (let i = 0; i < startDay; i++) {
      dayArray.push({ date: null });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const dateString = date.toISOString().split('T')[0];
      dayArray.push({
        date,
        events: events.filter(e => e.date === dateString),
      });
    }
    return dayArray;
  }, [currentDate, events, startDay, daysInMonth]);

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };
  const handleDayClick = (day: Date) => setSelectedDate(day);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    onAddEvent({
      date: selectedDate.toISOString().split('T')[0],
      title: newEventTitle,
      color: newEventColor,
    });
    setNewEventTitle('');
    setNewEventColor(eventColors[0]);
    setIsModalOpen(false);
  };
  
  const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
  const selectedDateEvents = events.filter(e => e.date === selectedDate.toISOString().split('T')[0]);

  return (
    <div className="h-full flex p-4 gap-4">
      {/* Calendar Grid */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <div className="flex items-center gap-2">
            <button onClick={handlePrevMonth} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"><ChevronLeft size={20} /></button>
            <button onClick={handleToday} className="px-3 py-1 text-sm font-medium border border-gray-300 dark:border-slate-600 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700">Today</button>
            <button onClick={handleNextMonth} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700"><ChevronRight size={20} /></button>
          </div>
        </header>
        <div className="grid grid-cols-7 text-center text-xs text-gray-500 font-semibold border-b dark:border-slate-700">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => <div key={day} className="py-2">{day}</div>)}
        </div>
        <div className="grid grid-cols-7 flex-1">
          {days.map((day, index) => (
            <div key={index} className="border-t border-r dark:border-slate-700 p-1.5 flex flex-col">
              {day.date && (
                <button onClick={() => handleDayClick(day.date)} className={`flex flex-col items-center justify-center w-full h-full rounded-md transition-colors ${isSameDay(day.date, selectedDate) ? 'bg-[var(--accent-color)]/20' : 'hover:bg-gray-100 dark:hover:bg-slate-700/50'}`}>
                  <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isSameDay(day.date, new Date()) ? 'bg-[var(--accent-color)] text-white' : ''}`}>
                    {day.date.getDate()}
                  </span>
                  <div className="flex gap-1 mt-2 h-2">
                    {day.events.slice(0, 3).map(event => <div key={event.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: event.color }}></div>)}
                  </div>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Event Sidebar */}
      <aside className="w-64 bg-gray-50 dark:bg-slate-800 rounded-lg p-4 flex flex-col">
        <h3 className="font-bold text-lg mb-4">{selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
        <div className="flex-1 overflow-y-auto space-y-3">
          {selectedDateEvents.length > 0 ? (
            selectedDateEvents.map(event => (
              <div key={event.id} className="flex items-start gap-3 group">
                <div className="w-1 h-8 rounded-full mt-1" style={{ backgroundColor: event.color }}></div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{event.title}</p>
                </div>
                <button onClick={() => onDeleteEvent(event.id)} className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 italic mt-4 text-center">No events scheduled.</p>
          )}
        </div>
        <button onClick={() => setIsModalOpen(true)} className="w-full mt-4 bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium">
          <Plus size={16} /> Add Event
        </button>
      </aside>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Add Event for {selectedDate.toLocaleDateString('default', { month: 'long', day: 'numeric' })}</h3>
            <form onSubmit={handleAddEvent}>
              <input
                type="text"
                value={newEventTitle}
                onChange={e => setNewEventTitle(e.target.value)}
                placeholder="Event title"
                className="w-full bg-gray-100 dark:bg-slate-700 border-0 rounded-lg p-3 text-sm mb-4"
                autoFocus
              />
              <div className="flex gap-3 mb-6">
                {eventColors.map(color => (
                  <button type="button" key={color} onClick={() => setNewEventColor(color)} className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 ${newEventColor === color ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-[var(--accent-color)]' : ''}`} style={{ backgroundColor: color }}></button>
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">Cancel</button>
                <button type="submit" disabled={!newEventTitle.trim()} className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--accent-color)] text-white disabled:opacity-50">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
