import React, { useState } from 'react';
import { JournalEntry } from '../types.ts';
import { Smile, Meh, Frown, Zap, Plus, Calendar, BookOpen } from 'lucide-react';

interface JournalProps {
  entries: JournalEntry[];
  onAddEntry: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
}

const Journal: React.FC<JournalProps> = ({ entries, onAddEntry }) => {
  const [isWriting, setIsWriting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newMood, setNewMood] = useState<JournalEntry['mood']>('neutral');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    onAddEntry({ title: newTitle, content: newContent, mood: newMood });
    setNewTitle(''); setNewContent(''); setNewMood('neutral'); setIsWriting(false);
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'happy': return <Smile className="text-green-500" />;
      case 'focused': return <Zap className="text-yellow-500" />;
      case 'tired': return <Frown className="text-blue-500" />;
      default: return <Meh className="text-gray-500" />;
    }
  };

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Journal</h2>
        <button onClick={() => setIsWriting(!isWriting)} className="bg-[var(--accent-color)] hover:bg-[var(--accent-color-hover)] text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm">
          {isWriting ? 'Cancel' : <><Plus size={16} /> New Entry</>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {isWriting && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700/50 p-4 space-y-3">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between">
                <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Entry Title" className="flex-1 bg-transparent text-lg font-bold text-slate-900 dark:text-white border-none focus:ring-0 p-0" autoFocus />
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 p-1 rounded-lg">
                  {['happy', 'neutral', 'focused', 'tired'].map((m) => (
                    <button key={m} type="button" onClick={() => setNewMood(m as any)} className={`p-1.5 rounded-md ${newMood === m ? 'bg-white dark:bg-slate-600' : 'opacity-50'}`}>{getMoodIcon(m)}</button>
                  ))}
                </div>
              </div>
              <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="Write your thoughts..." className="w-full h-32 bg-gray-50 dark:bg-slate-900/50 rounded-lg border-0 focus:ring-2 p-2" />
              <div className="flex justify-end">
                <button type="submit" disabled={!newTitle.trim() || !newContent.trim()} className="bg-[var(--accent-color)] text-white px-4 py-1.5 rounded-lg font-medium text-sm disabled:opacity-50">Save</button>
              </div>
            </form>
          </div>
        )}
        {entries.length > 0 ? (
          entries.map(entry => (
            <div key={entry.id} className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700/50 p-4">
              <div className="flex items-start gap-3 mb-2">
                <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-full">{getMoodIcon(entry.mood)}</div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{entry.title}</h3>
                  <span className="text-xs text-gray-500">{new Date(entry.date).toLocaleString()}</span>
                </div>
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap">{entry.content}</p>
            </div>
          ))
        ) : (
          !isWriting && (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500 pt-8">
              <BookOpen size={48} className="mb-4 opacity-20" />
              <p className="font-medium">Your journal is empty.</p>
              <p className="text-sm">Click "New Entry" to write down your thoughts.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Journal;