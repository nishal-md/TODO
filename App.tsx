
import React, { useState, useEffect, useCallback } from 'react';
import { Task, Priority, Subtask } from './types';
import { analyzeTaskWithAI } from './geminiService';
import PromptBox from './components/PromptBox';
import TaskCard from './components/TaskCard';
import Calendar from './components/Calendar';
import Pomodoro from './components/Pomodoro';
import Insights from './components/Insights';

type Tab = 'tasks' | 'planner' | 'insights';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('tasks');
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
      subtasks: (aiData.subtasks || []).map(s => ({
        id: Math.random().toString(36).substr(2, 9),
        text: s,
        completed: false
      })),
      createdAt: Date.now(),
      dueDate: customDueDate || selectedDueDate || Date.now(),
    };

    setTasks(prev => [newTask, ...prev]);
    setIsAnalyzing(false);
    // After adding from planner, maybe switch back to tasks or stay
    if (activeTab === 'planner') setActiveTab('tasks');
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
        return { ...t, completed: becomingCompleted, completedAt: becomingCompleted ? Date.now() : undefined };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = (t.subtasks || []).map(s => {
          if (s.id === subtaskId) {
            const becomingCompleted = !s.completed;
            if (becomingCompleted) setStreakPoints(p => p + 2);
            else setStreakPoints(p => Math.max(0, p - 2));
            return { ...s, completed: becomingCompleted };
          }
          return s;
        });
        return { ...t, subtasks: updatedSubtasks };
      }
      return t;
    }));
  };

  const addSubtask = (taskId: string, text: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newSubtask: Subtask = {
          id: Math.random().toString(36).substr(2, 9),
          text,
          completed: false
        };
        return { ...t, subtasks: [...(t.subtasks || []), newSubtask] };
      }
      return t;
    }));
  };

  const editSubtask = (taskId: string, subtaskId: string, newText: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = (t.subtasks || []).map(s => 
          s.id === subtaskId ? { ...s, text: newText } : s
        );
        return { ...t, subtasks: updatedSubtasks };
      }
      return t;
    }));
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = (t.subtasks || []).filter(s => s.id !== subtaskId);
        return { ...t, subtasks: updatedSubtasks };
      }
      return t;
    }));
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const handleDateSelectInPlanner = (ts: number) => {
    setSelectedDueDate(ts);
    // Logic is handled by the modal effect or UI prompt
  };

  return (
    <div className="min-h-screen relative selection:bg-red-500/30 overflow-x-hidden">
      <div className="bg-grid"></div>
      <div className="bg-blob blob-blue"></div>
      <div className="bg-blob blob-red"></div>

      <style>{`
        @keyframes floatUp { 0% { transform: translateY(0); opacity: 0; } 20% { opacity: 1; } 100% { transform: translateY(-40px); opacity: 0; } }
        @keyframes badgePop { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        .animate-float-up { animation: floatUp 1s ease-out forwards; }
        .animate-badge-pop { animation: badgePop 0.3s ease-out; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] transition-all duration-300" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 right-0 h-full w-[340px] bg-[#0e0e11]/90 backdrop-blur-2xl border-l border-white/10 z-[70] transition-transform duration-500 transform ${isSidebarOpen ? 'translate-x-0 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]' : 'translate-x-full'} p-8 overflow-y-auto space-y-10`}>
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-white uppercase italic">Session</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-gray-500 hover:text-white transition-colors duration-300"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
        </div>
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">Timer</label>
          <Pomodoro />
        </div>
        <div className="pt-6 border-t border-white/5">
            <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em] mb-4">Progression</h3>
            <div className="bg-gradient-to-br from-red-500/10 to-transparent p-5 rounded-2xl border border-red-500/20">
                <p className="text-sm text-gray-300 leading-relaxed font-medium">Complete tasks to earn streak points.</p>
            </div>
        </div>
      </aside>

      <nav className="px-8 py-8 flex items-center justify-between sticky top-0 bg-[#0e0e11]/40 backdrop-blur-md z-50">
        <div className="flex items-center gap-10">
            <div className="text-4xl font-black tracking-tighter text-white cursor-pointer" onClick={() => setActiveTab('tasks')}>du<span className="text-blue-500">.</span></div>
            <div className="hidden md:flex items-center gap-6">
              {[
                { id: 'tasks', label: 'Dashboard' },
                { id: 'planner', label: 'Planner' },
                { id: 'insights', label: 'Insights' }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  {tab.label}
                  {activeTab === tab.id && <span className="absolute -bottom-2 left-0 w-full h-[2px] bg-blue-500 rounded-full"></span>}
                </button>
              ))}
            </div>
        </div>
        
        <div className="flex items-center gap-6">
            <div className={`relative flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-full border border-white/5 transition-all duration-300 ${pointsDelta ? 'animate-badge-pop border-blue-500/30' : ''}`}>
                <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)] animate-pulse"></div>
                <span className="text-sm font-black text-white tabular-nums tracking-tight">{streakPoints} <span className="text-gray-500 font-bold ml-1">STREAK</span></span>
                {pointsDelta && <span key={pointsDelta.id} className={`absolute -bottom-10 left-1/2 -translate-x-1/2 text-sm font-black animate-float-up ${pointsDelta.value > 0 ? 'text-blue-400' : 'text-red-400'}`}>{pointsDelta.value > 0 ? `+${pointsDelta.value}` : pointsDelta.value}</span>}
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="p-3 bg-white/5 hover:bg-blue-600 rounded-2xl border border-white/5 transition-all duration-300 group">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white group-hover:scale-110 transition-transform"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-12 pb-32">
        {activeTab === 'tasks' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-12">
              <h1 className="text-6xl font-black text-white mb-4 tracking-tighter du-text-gradient">Daily Workflow</h1>
              <p className="text-gray-400 flex items-center gap-3 text-base font-medium">Currently managing <span className="text-blue-400 font-black">{tasks.filter(t => !t.completed).length} items</span> in your pipeline</p>
            </div>
            <PromptBox onAdd={(text, priority) => handleAddTask(text, priority)} isLoading={isAnalyzing} />
            <div className="flex gap-4 mt-16 mb-10 overflow-x-auto pb-4 scrollbar-hide">
                {['all', 'active', 'completed'].map((f) => (
                    <button key={f} onClick={() => setFilter(f as any)} className={`px-8 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${filter === f ? 'bg-red-600 text-white shadow-[0_10px_30px_rgba(239,68,68,0.3)]' : 'text-gray-500 hover:text-white bg-white/5 border border-white/10'}`}>{f}</button>
                ))}
            </div>
            <div className="grid gap-6">
                {filteredTasks.length === 0 ? (
                    <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[2.5rem] bg-white/[0.02]"><p className="text-gray-500 font-black text-lg uppercase tracking-widest">No Active Tasks</p></div>
                ) : (
                    filteredTasks.map(task => <TaskCard key={task.id} task={task} onToggle={() => toggleTask(task.id)} onDelete={() => deleteTask(task.id)} onToggleSubtask={(sid) => toggleSubtask(task.id, sid)} onAddSubtask={(txt) => addSubtask(task.id, txt)} onEditSubtask={(sid, txt) => editSubtask(task.id, sid, txt)} onDeleteSubtask={(sid) => deleteSubtask(task.id, sid)} />)
                )}
            </div>
          </div>
        )}

        {activeTab === 'planner' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-12">
              <h1 className="text-6xl font-black text-white mb-4 tracking-tighter du-text-gradient">Planner</h1>
              <p className="text-gray-400 text-base font-medium italic">Click any date to schedule a new commitment.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8">
                <Calendar tasks={tasks} onDateSelect={handleDateSelectInPlanner} />
              </div>
              <div className="lg:col-span-4 space-y-8">
                <div className="glass-card rounded-3xl p-8 border border-white/5 bg-blue-500/5">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-400 mb-6">Schedule Task</h3>
                  <p className="text-sm text-gray-400 mb-6">Scheduling for: <span className="text-white font-bold">{new Date(selectedDueDate).toLocaleDateString()}</span></p>
                  <PromptBox onAdd={(text, priority) => handleAddTask(text, priority)} isLoading={isAnalyzing} />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && <Insights tasks={tasks} />}
      </main>

      <footer className="max-w-4xl mx-auto px-6 py-12 text-center opacity-20 hover:opacity-100 transition-opacity duration-500">
        <div className="flex items-center justify-center gap-8">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20"></div>
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Focus First</div>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20"></div>
        </div>
      </footer>
    </div>
  );
};

export default App;
