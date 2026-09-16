import React from 'react';
import { Car, Users, ClipboardCheck, RotateCcw, MapPin, Calendar } from 'lucide-react';
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


  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-100 shadow-xs">
      {/* Top Brand Strip */}
      <div className="bg-gradient-to-r from-amber-800 via-stone-800 to-amber-900 text-amber-50 px-4 py-2">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold tracking-wide">空山寺中秋交通互助平台 • 義工與正行車位共乘</span>
          </div>
          <button
            onClick={onResetData}
            title="將資料還原為初始範例狀態"
            className="flex items-center gap-1 text-amber-200 hover:text-white transition-colors cursor-pointer py-1 px-2.5 rounded-md hover:bg-stone-800/80 text-xs font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置範例資料</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-5xl mx-auto px-4 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-2xl bg-black border border-stone-800 text-white flex items-center justify-center shadow-xs shrink-0 overflow-hidden p-1">
              <img src="/kongshan_logo.png" alt="空山寺" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-1.5">
                  空山寺 <span className="text-base md:text-lg font-bold text-stone-600">中秋共乘網</span>
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                  美東 • 義工/正行
                </span>
              </div>
              <p className="text-xs md:text-sm text-stone-600 flex items-center gap-1 mt-0.5 font-medium">
                <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                <span>174 Hynes RD, Poughquag, NY 12570</span>
              </p>
            </div>
          </div>

          {/* Event Selector */}
          <div className="flex items-center gap-2 bg-stone-100 border border-stone-200 rounded-xl p-2 self-start md:self-auto w-full md:w-auto">
            <Calendar className="w-4 h-4 text-amber-700 ml-1 shrink-0" />
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              aria-label="選擇活動"
              className="bg-transparent text-xs md:text-sm font-bold text-stone-800 focus:outline-hidden cursor-pointer w-full md:w-auto pr-2"
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title} ({evt.date.split('（')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Role Tabs - Large Touch Targets for Seniors */}
        <div className="mt-3.5 pt-2.5 border-t border-stone-200 flex gap-2">
          <button
            onClick={() => setCurrentTab('passenger')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer shadow-xs ${
              currentTab === 'passenger'
                ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/30'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>🙋 我要搭車</span>
          </button>

          <button
            onClick={() => setCurrentTab('driver')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer shadow-xs ${
              currentTab === 'driver'
                ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-600/30'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <Car className="w-5 h-5" />
            <span>🚗 我有空位</span>
          </button>

          <button
            onClick={() => setCurrentTab('admin')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-xl text-sm md:text-base font-bold transition-all cursor-pointer shadow-xs ${
              currentTab === 'admin'
                ? 'bg-stone-900 text-white shadow-sm ring-2 ring-stone-900/30'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
            }`}
          >
            <ClipboardCheck className="w-5 h-5" />
            <span>📋 報名報到組後台</span>
          </button>
        </div>
      </div>
    </header>
  );
};
