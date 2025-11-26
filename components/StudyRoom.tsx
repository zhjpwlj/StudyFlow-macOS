import React from 'react';
import { Users, Video, Mic, MessageSquare, Heart } from 'lucide-react';

const StudyRoom: React.FC = () => {
  const users = [
    { id: 1, name: 'Alex', avatar: 'A', isMuted: true },
    { id: 2, name: 'Sarah', avatar: 'S', isMuted: false },
    { id: 3, name: 'Mike', avatar: 'M', isMuted: true },
    { id: 4, name: 'Jessica', avatar: 'J', isMuted: true },
  ];

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
         <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                Global Study Lounge
            </h2>
         </div>
         <div className="flex items-center gap-2">
             <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold">24 Online</span>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden">
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-min overflow-y-auto">
              <div className="aspect-video bg-gray-900 rounded-lg relative border-2 border-indigo-500">
                  <div className="absolute inset-0 flex items-center justify-center text-white"><div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-xl font-bold">You</div></div>
                  <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">Me (Focusing)</div>
              </div>
              {users.map(user => (
                  <div key={user.id} className="aspect-video bg-gray-800 rounded-lg relative">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} className="w-full h-full object-cover opacity-80" />
                       <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white">{user.name}</div>
                  </div>
              ))}
          </div>

          <div className="bg-white dark:bg-slate-800/50 rounded-lg border border-gray-200 dark:border-slate-700/50 flex flex-col h-full overflow-hidden">
              <div className="p-3 border-b border-gray-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-white text-sm">Live Chat</div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3 text-sm">
                  <div><span className="font-bold text-indigo-600 dark:text-indigo-400">Sarah:</span> Good luck everyone!</div>
                  <div className="text-right"><span className="font-bold text-gray-500">You:</span> Thanks!</div>
              </div>
              <div className="p-2 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50">
                   <input type="text" placeholder="Type..." className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-sm" />
              </div>
          </div>
      </div>
    </div>
  );
};

export default StudyRoom;
