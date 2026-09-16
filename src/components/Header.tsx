import React from 'react';
import { Car, Users, ClipboardCheck, Sparkles, RotateCcw, MapPin, Calendar } from 'lucide-react';
import type { Event } from '../types';

interface HeaderProps {
  currentTab: 'passenger' | 'driver' | 'admin';
  setCurrentTab: (tab: 'passenger' | 'driver' | 'admin') => void;
  events: Event[];
  selectedEventId: string;
  setSelectedEventId: (id: string) => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  events,
  selectedEventId,
  setSelectedEventId,
  onResetData,
}) => {
  const currentEvent = events.find((e) => e.id === selectedEventId);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-xs">
      {/* Top Brand Strip */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-amber-50 px-4 py-2">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-medium tracking-wide">法會交通互助結緣平台 • 義工發心車位媒合</span>
          </div>
          <button
            onClick={onResetData}
            title="將資料還原為初始範例狀態"
            className="flex items-center gap-1 text-amber-200 hover:text-white transition-colors cursor-pointer py-0.5 px-2 rounded hover:bg-amber-800/60"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置展示資料</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold text-stone-800 tracking-tight">
                  寺院法會共乘網
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
                  信眾同修互助
                </span>
              </div>
              <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                {currentEvent?.templeName || '道場總本山'}
              </p>
            </div>
          </div>

          {/* Event Selector */}
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-lg p-1.5 self-start md:self-auto w-full md:w-auto">
            <Calendar className="w-4 h-4 text-amber-700 ml-1.5 shrink-0" />
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              aria-label="選擇法會活動"
              className="bg-transparent text-sm font-medium text-stone-700 focus:outline-hidden cursor-pointer w-full md:w-auto pr-2"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title} ({evt.date.split('（')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Role Tabs */}
        <div className="mt-3 pt-2 border-t border-stone-100 flex gap-2">
          <button
            onClick={() => setCurrentTab('passenger')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'passenger'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>🙋 我要搭車（找車位）</span>
          </button>

          <button
            onClick={() => setCurrentTab('driver')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'driver'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>🚗 我有空位（提供車位）</span>
          </button>

          <button
            onClick={() => setCurrentTab('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              currentTab === 'admin'
                ? 'bg-stone-800 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>📋 交通組後台</span>
          </button>
        </div>
      </div>
    </header>
  );
};
