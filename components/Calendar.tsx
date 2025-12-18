
import React, { useState } from 'react';

interface CalendarProps {
  tasks: { dueDate: number; completed: boolean }[];
  onDateSelect: (timestamp: number) => void;
}

const Calendar: React.FC<CalendarProps> = ({ tasks, onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayTs, setSelectedDayTs] = useState<number | null>(new Date().setHours(0,0,0,0));

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
    const ts = new Date(year, month, day).setHours(12,0,0,0);
    setSelectedDayTs(new Date(year, month, day).setHours(0,0,0,0));
    onDateSelect(ts);
  };

  return (
    <div className="glass-card rounded-[2.5rem] p-10 border border-white/5 transition-all">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{monthName} <span className="text-gray-700 ml-2">{year}</span></h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentDate(new Date(year, month - 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-2xl transition-all text-gray-400 border border-white/5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button 
            onClick={() => setCurrentDate(new Date(year, month + 1))}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-2xl transition-all text-gray-400 border border-white/5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {[...padding, ...days].map((day, i) => {
          const status = day ? getDayStatus(day) : null;
          const isSelected = day ? new Date(year, month, day).setHours(0,0,0,0) === selectedDayTs : false;
          
          return (
            <div 
              key={i} 
              onClick={() => day && handleDayClick(day)}
              className={`aspect-square flex flex-col items-center justify-center text-sm rounded-2xl relative cursor-pointer transition-all duration-300 ${
                day === null ? 'pointer-events-none' : 'hover:scale-105 hover:bg-blue-600/10'
              } ${isToday(day!) ? 'text-blue-400 font-black ring-1 ring-blue-500/20' : 'text-gray-400'} ${
                isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-black' : 'bg-white/[0.02]'
              }`}
            >
              {day}
              {status && !isSelected && (
                <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${
                  status === 'overdue' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 
                  status === 'today' ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]' : 
                  'bg-white/40'
                }`}></div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-10 flex flex-wrap gap-6 justify-center border-t border-white/5 pt-8">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500"></div>
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Overdue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-400"></div>
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white/40"></div>
          <span className="text-[10px] uppercase tracking-widest text-gray-500 font-black">Upcoming</span>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
