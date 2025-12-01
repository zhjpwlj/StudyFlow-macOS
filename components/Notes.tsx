import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { Plus, Trash2, FileText } from 'lucide-react';

interface NotesProps {
  notes: Note[];
  onAddNote: () => void;
  onUpdateNote: (id: string, content: string) => void;
  onDeleteNote: (id: string) => void;
}

const Notes: React.FC<NotesProps> = ({ notes, onAddNote, onUpdateNote, onDeleteNote }) => {
  const sortedNotes = [...notes].sort((a, b) => b.createdAt - a.createdAt);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(sortedNotes[0]?.id || null);
  
  useEffect(() => {
    // If the active note is deleted, select the new first one
    if (activeNoteId && !notes.find(n => n.id === activeNoteId)) {
      setActiveNoteId(sortedNotes[0]?.id || null);
    }
    // If there are notes but none is selected, select the first one
    if (!activeNoteId && sortedNotes.length > 0) {
      setActiveNoteId(sortedNotes[0].id);
    }
  }, [notes, activeNoteId, sortedNotes]);
  
  const activeNote = notes.find(n => n.id === activeNoteId);

  const handleAddNote = () => {
    onAddNote();
    // The useEffect will handle setting the new note as active
  };

  const handleDeleteNote = (id: string) => {
    onDeleteNote(id);
  };
  
  return (
    <div className="h-full flex">
      <aside className="w-48 bg-gray-50 dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700/50 flex flex-col">
        <div className="p-2 border-b border-gray-200 dark:border-slate-700/50 flex justify-between items-center">
            <h2 className="text-sm font-semibold pl-2">All Notes</h2>
            <button onClick={handleAddNote} className="p-2 text-gray-500 hover:text-[var(--accent-color)] hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md">
                <Plus size={16} />
            </button>
        </div>
        <div className="flex-1 overflow-y-auto">
            {sortedNotes.map(note => (
                <button 
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    className={`w-full text-left p-3 text-sm truncate ${activeNoteId === note.id ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] font-semibold' : 'hover:bg-gray-200 dark:hover:bg-slate-700'}`}>
                    {note.content.split('\n')[0] || 'New Note'}
                    <span className="block text-xs text-gray-400 mt-1">{new Date(note.createdAt).toLocaleDateString()}</span>
                </button>
            ))}
        </div>
      </aside>
      <main className="flex-1 flex flex-col">
        {activeNote ? (
            <>
                <div className="p-2 border-b border-gray-200 dark:border-slate-700/50 flex justify-end">
                    <button onClick={() => handleDeleteNote(activeNote.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-md">
                        <Trash2 size={16} />
                    </button>
                </div>
                <textarea
                    key={activeNote.id}
                    value={activeNote.content}
                    onChange={(e) => onUpdateNote(activeNote.id, e.target.value)}
                    className="w-full h-full p-4 bg-transparent resize-none focus:outline-none text-base leading-relaxed"
                    placeholder="Start writing..."
                />
            </>
        ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-8 text-center">
                <FileText size={48} className="mb-4 opacity-20" />
                <p className="font-medium">No notes selected</p>
                <p className="text-sm">Create a new note to get started.</p>
            </div>
        )}
      </main>
    </div>
  );
};

export default Notes;
