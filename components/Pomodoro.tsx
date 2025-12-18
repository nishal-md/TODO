
import React, { useState, useEffect } from 'react';

const Pomodoro: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'work' ? 25 * 60 : mode === 'short' ? 5 * 60 : 15 * 60);
  };

  const changeMode = (newMode: 'work' | 'short' | 'long') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'work' ? 25 * 60 : newMode === 'short' ? 5 * 60 : 15 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="bg-black/40 rounded-2xl p-6 flex flex-col items-center border border-white/5">
      <div className="flex gap-2 mb-6 bg-black/20 p-1 rounded-xl w-full">
        {(['work', 'short', 'long'] as const).map(m => (
          <button
            key={m}
            onClick={() => changeMode(m)}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
              mode === m ? 'bg-red-500 text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {m === 'work' ? 'Focus' : m === 'short' ? 'Break' : 'Long'}
          </button>
        ))}
      </div>
      
      <div className="text-5xl font-black tracking-tighter text-white mb-6 tabular-nums">
        {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
      </div>

      <div className="flex gap-2 w-full">
        <button 
          onClick={toggleTimer}
          className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            isActive 
            ? 'bg-white/5 text-white border border-white/10' 
            : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
        >
          {isActive ? 'Pause' : 'Start'}
        </button>
        <button 
          onClick={resetTimer}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10 text-gray-400"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
        </button>
      </div>
    </div>
  );
};

export default Pomodoro;
