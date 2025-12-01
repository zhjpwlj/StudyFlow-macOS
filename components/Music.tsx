import React, { useState } from 'react';
import { Music as MusicIcon, Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';

const Music: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-6 bg-gradient-to-br from-indigo-900 to-slate-900 text-white">
        <div className="w-48 h-48 bg-slate-800 rounded-lg shadow-2xl flex items-center justify-center relative overflow-hidden group">
            <MusicIcon size={64} className="text-slate-600 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
        
        <div>
            <h3 className="text-xl font-bold">Lofi Study Beats</h3>
            <p className="text-slate-400 text-sm">Focus Flow Radio</p>
        </div>

        <div className="flex items-center gap-6">
            <button className="text-slate-300 hover:text-white"><SkipBack size={24} /></button>
            <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                className="w-16 h-16 bg-white text-slate-900 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
                {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>
            <button className="text-slate-300 hover:text-white"><SkipForward size={24} /></button>
        </div>
        
        <div className="w-full max-w-xs flex items-center gap-2 text-slate-400">
            <Volume2 size={16} />
            <div className="h-1 flex-1 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full w-2/3 bg-white"></div>
            </div>
        </div>
    </div>
  );
};

export default Music;