
import React, { useState } from 'react';

interface CalendarProps {
  tasks: { dueDate: number; completed: boolean }[];
  onDateSelect: (timestamp: number) => void;
}

const Calendar: React.FC<CalendarProps> = ({ tasks, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayTs, setSelectedDayTs] = useState<number | null>(null);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysCount = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);

  const days = Array.from({ length: daysCount }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, (_, i) => null);

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const getDayStatus = (day: number) => {
    const dayDate = new Date(year, month, day);
    const dayStart = new Date(year, month, day).setHours(0, 0, 0, 0);
    const dayEnd = new Date(year, month, day).setHours(23, 59, 59, 999);
    const now = new Date().setHours(0, 0, 0, 0);

    const tasksOnDay = tasks.filter(t => t.dueDate >= dayStart && t.dueDate <= dayEnd && !t.completed);
    
    if (tasksOnDay.length === 0) return null;

    if (dayStart < now) return 'overdue';
    if (dayStart === now) return 'today';
    return 'upcoming';
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const handleDayClick = (day: number) => {
    const ts = new Date(year, month, day).getTime();
    setSelectedDayTs(ts);
    onDateSelect(ts);
  };

  return (
    <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-sm text-white/90">{monthName} {year}</h3>
        <div className="flex gap-1">
          <button 
            onClick={() => setCurrentDate(new Date(year, month - 1))}
            className="p-1 hover:bg-white/5 rounded-lg transition-colors text-gray-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button 
            onClick={() => setCurrentDate(new Date(year, month + 1))}
            className="p-1 hover:bg-white/5 rounded-lg transition-colors text-gray-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <div key={d} className="text-[9px] font-bold text-gray-600 uppercase">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {[...padding, ...days].map((day, i) => {
          const status = day ? getDayStatus(day) : null;
          const isSelected = day ? new Date(year, month, day).getTime() === selectedDayTs : false;
          
          return (
            <div 
              key={i} 
              onClick={() => day && handleDayClick(day)}
              className={`aspect-square flex flex-col items-center justify-center text-xs rounded-lg relative cursor-pointer transition-all ${
                day === null ? 'pointer-events-none' : 'hover:bg-blue-500/10 hover:text-blue-400'
              } ${isToday(day!) ? 'text-blue-400 font-black' : 'text-gray-400'} ${
                isSelected ? 'bg-blue-600/20 ring-1 ring-blue-500/50' : ''
              }`}
            >
              {day}
              {status && (
                <div className={`w-1 h-1 rounded-full mt-0.5 ${
                  status === 'overdue' ? 'bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.5)]' : 
                  status === 'today' ? 'bg-blue-400 shadow-[0_0_5px_rgba(96,165,250,0.5)]' : 
                  'bg-white/40'
                }`}></div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 justify-center border-t border-white/5 pt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
          <span className="text-[8px] uppercase tracking-tighter text-gray-500 font-bold">Overdue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
          <span className="text-[8px] uppercase tracking-tighter text-gray-500 font-bold">Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white/40"></div>
          <span className="text-[8px] uppercase tracking-tighter text-gray-500 font-bold">Upcoming</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
