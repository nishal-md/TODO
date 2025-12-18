
import React, { useState, useEffect, useCallback } from 'react';
import { Task, Priority } from './types';
import { analyzeTaskWithAI, generateTaskSuggestions } from './geminiService';
import PromptBox from './components/PromptBox';
import TaskCard from './components/TaskCard';
import Calendar from './components/Calendar';
import Pomodoro from './components/Pomodoro';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [streakPoints, setStreakPoints] = useState(0);
  const [selectedDueDate, setSelectedDueDate] = useState<number>(Date.now());
  const [pointsDelta, setPointsDelta] = useState<{ value: number; id: number } | null>(null);

  useEffect(() => {
    const savedTasks = localStorage.getItem('du-tasks');
    const savedPoints = localStorage.getItem('du-points');
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedPoints) setStreakPoints(parseInt(savedPoints));
  }, []);

  useEffect(() => {
    localStorage.setItem('du-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('du-points', streakPoints.toString());
  }, [streakPoints]);

  const handleAddTask = async (text: string, priority: Priority, customDueDate?: number) => {
    if (!text.trim()) return;

    setIsAnalyzing(true);
    const aiData = await analyzeTaskWithAI(text);
    
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      text,
      completed: false,
      priority: aiData.priority || priority,
      category: aiData.category || 'General',
      subtasks: aiData.subtasks || [],
      createdAt: Date.now(),
      dueDate: customDueDate || selectedDueDate || Date.now(),
    };

    setTasks(prev => [newTask, ...prev]);
    setIsAnalyzing(false);
    setSelectedDueDate(Date.now()); // Reset for next add
  };

  const triggerPointsAnimation = (value: number) => {
    setPointsDelta({ value, id: Date.now() });
    setTimeout(() => setPointsDelta(null), 1000);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const becomingCompleted = !t.completed;
        if (becomingCompleted) {
          setStreakPoints(prevPoints => prevPoints + 10);
          triggerPointsAnimation(10);
        } else {
          setStreakPoints(prevPoints => Math.max(0, prevPoints - 10));
          triggerPointsAnimation(-10);
        }
        return { ...t, completed: becomingCompleted };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const handleDateSelect = (timestamp: number) => {
    setSelectedDueDate(timestamp);
  };

  return (
    <div className="min-h-screen bg-[#0e0e11] text-white selection:bg-red-500/30 overflow-x-hidden">
      
      {/* Global CSS for Animations */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: 1; }
          100% { transform: translateY(-40px); opacity: 0; }
        }
        @keyframes badgePop {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .animate-float-up { animation: floatUp 1s ease-out forwards; }
        .animate-badge-pop { animation: badgePop 0.3s ease-out; }
      `}</style>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Slide Sidebar */}
      <aside className={`fixed top-0 right-0 h-full w-[320px] bg-[#141517] border-l border-white/5 z-[70] transition-transform duration-300 transform ${
          isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
      } p-6 overflow-y-auto space-y-8`}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold tracking-tight text-white">Focus Tools</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
        
        <Pomodoro />
        <Calendar tasks={tasks} onDateSelect={handleDateSelect} />
        
        <div className="pt-6 border-t border-white/5">
            <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4">Point System</h3>
            <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                <p className="text-sm text-gray-300 leading-relaxed">Complete tasks to earn streak points. Every task is worth <span className="text-red-400 font-bold">10 pts</span>.</p>
            </div>
        </div>
      </aside>

      {/* Main UI */}
      <nav className="px-6 py-6 flex items-center justify-between sticky top-0 bg-[#0e0e11]/80 backdrop-blur-lg z-50">
        <div className="flex items-center gap-4">
            <div className="text-3xl font-black tracking-tighter text-blue-500">du<span className="text-red-500">.</span></div>
        </div>
        
        <div className="flex items-center gap-6">
            <div className={`relative flex items-center gap-2 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 transition-all ${pointsDelta ? 'animate-badge-pop border-blue-500/50' : ''}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span className="text-sm font-bold text-white tabular-nums">{streakPoints} <span className="hidden sm:inline">Streak Points</span></span>
                
                {pointsDelta && (
                  <span 
                    key={pointsDelta.id}
                    className={`absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-bold animate-float-up ${pointsDelta.value > 0 ? 'text-blue-400' : 'text-red-400'}`}
                  >
                    {pointsDelta.value > 0 ? `+${pointsDelta.value}` : pointsDelta.value}
                  </span>
                )}
            </div>
            <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors group"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-blue-400 transition-colors"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 pt-12">
        <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-2">Tasks</h1>
            <div className="flex flex-col gap-1">
              <p className="text-gray-500 flex items-center gap-2 text-sm">
                  Focused on <span className="text-blue-400 font-medium transition-all duration-300">{tasks.filter(t => !t.completed).length} items</span> remaining today
              </p>
              {selectedDueDate && new Date(selectedDueDate).toDateString() !== new Date().toDateString() && (
                <p className="text-blue-400/80 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                  Planning for {new Date(selectedDueDate).toLocaleDateString()}
                  <button 
                    onClick={() => setSelectedDueDate(Date.now())}
                    className="ml-2 hover:text-white transition-colors"
                  >
                    (Reset to today)
                  </button>
                </p>
              )}
            </div>
        </div>

        <PromptBox 
            onAdd={(text, priority) => handleAddTask(text, priority)} 
            isLoading={isAnalyzing} 
        />

        <div className="flex gap-3 mt-10 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {['all', 'active', 'completed'].map((f) => (
                <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                        filter === f 
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
                        : 'text-gray-500 hover:text-white bg-white/5 border border-white/5'
                    }`}
                >
                    {f}
                </button>
            ))}
        </div>

        <div className="grid gap-4">
            {filteredTasks.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl text-gray-600 font-medium">
                    No tasks found. Start adding some or check the sidebar for tools.
                </div>
            ) : (
                filteredTasks.map(task => (
                    <TaskCard 
                        key={task.id} 
                        task={task} 
                        onToggle={() => toggleTask(task.id)} 
                        onDelete={() => deleteTask(task.id)} 
                    />
                ))
            )}
        </div>

        <button 
            onClick={() => setIsSidebarOpen(true)}
            className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-40 lg:hidden"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </main>
    </div>
  );
};

export default App;
