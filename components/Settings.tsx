import React, { useState } from 'react';
import { Palette, Image as ImageIcon, Database, Trash2, Check, Sun, Moon } from 'lucide-react';
import { wallpapers, accentColors } from '../config/theme';

interface SettingsProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  accentColor: string;
  onSetAccentColor: (color: string) => void;
  wallpaper: string;
  onSetWallpaper: (wallpaperId: string) => void;
  onExportData: () => void;
  onWipeData: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isDarkMode, onToggleDarkMode, accentColor, onSetAccentColor, wallpaper, onSetWallpaper, onExportData, onWipeData }) => {
  const [activeTab, setActiveTab] = useState('appearance');

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data', icon: Database },
  ];

  return (
    <div className="h-full flex">
      <aside className="w-48 bg-white/50 dark:bg-slate-800/50 p-3 border-r border-white/20 dark:border-black/20">
        <nav className="space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-black/10 dark:bg-white/10 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'appearance' && (
          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Theme</h3>
              <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50 flex items-center justify-between">
                <p className="text-sm font-medium">Dark Mode</p>
                <button onClick={onToggleDarkMode} className="flex items-center gap-2 p-1 bg-gray-200 dark:bg-slate-700 rounded-full">
                    <span className={`p-1.5 rounded-full transition-colors ${!isDarkMode ? 'bg-white shadow' : ''}`}><Sun size={14}/></span>
                    <span className={`p-1.5 rounded-full transition-colors ${isDarkMode ? 'bg-slate-600 shadow' : ''}`}><Moon size={14}/></span>
                </button>
              </div>
            </section>
            
            <section>
              <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Accent Color</h3>
              <div className="flex flex-wrap gap-3">
                {accentColors.map(color => (
                  <button
                    key={color.name}
                    onClick={() => onSetAccentColor(color.hex)}
                    className="w-8 h-8 rounded-full transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-slate-900 focus:ring-[var(--accent-color)]"
                    style={{ backgroundColor: color.hex }}
                  >
                    {accentColor === color.hex && <Check size={16} className="text-white" />}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Wallpaper</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {wallpapers.map(wp => (
                  <button
                    key={wp.id}
                    onClick={() => onSetWallpaper(wp.id)}
                    className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors ${wallpaper === wp.id ? 'border-[var(--accent-color)]' : 'border-transparent hover:border-gray-400'}`}
                  >
                    <img src={isDarkMode ? wp.darkUrl : wp.lightUrl} alt={wp.id} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}
        {activeTab === 'data' && (
          <div className="space-y-8">
            <section>
              <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Manage Data</h3>
              <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Export Data</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Download all your tasks, timers, and journal entries as a JSON file.</p>
                  </div>
                  <button onClick={onExportData} className="px-3 py-1.5 bg-[var(--accent-color)] text-white rounded-lg text-sm font-medium hover:bg-[var(--accent-color-hover)]">Export</button>
                </div>
              </div>
            </section>
            <section>
              <h3 className="text-lg font-bold mb-3 text-red-500">Danger Zone</h3>
              <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-red-500/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Reset Application</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">This will permanently delete all your data and restore default settings.</p>
                  </div>
                  <button onClick={onWipeData} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">Wipe Data</button>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default Settings;
