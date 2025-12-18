
import React, { useMemo, useEffect, useState } from 'react';
import { Task, WeeklyInsight } from '../types';
import { getWeeklyProductivityAnalysis } from '../geminiService';

interface InsightsProps {
  tasks: Task[];
}

const Insights: React.FC<InsightsProps> = ({ tasks }) => {
  const [insight, setInsight] = useState<WeeklyInsight | null>(null);
  const [loading, setLoading] = useState(false);

  const stats = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toDateString();
    }).reverse();

    const dailyCompletion = last7Days.map(dayStr => {
      return tasks.filter(t => t.completed && t.completedAt && new Date(t.completedAt).toDateString() === dayStr).length;
    });

    const categories = tasks.reduce((acc: any, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {});

    const sortedCats = Object.entries(categories).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5);
    
    return { last7Days, dailyCompletion, sortedCats };
  }, [tasks]);

  useEffect(() => {
    const fetchInsight = async () => {
      if (tasks.length > 0) {
        setLoading(true);
        const data = await getWeeklyProductivityAnalysis(tasks);
        setInsight(data);
        setLoading(false);
      }
    };
    fetchInsight();
  }, [tasks.length]);

  const maxVal = Math.max(...stats.dailyCompletion, 1);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="glass-card rounded-3xl p-8 border border-white/5">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-8 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Weekly Output
          </h3>
          <div className="flex items-end justify-between h-48 gap-2">
            {stats.dailyCompletion.map((count, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <div 
                  className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all duration-1000 ease-out group-hover:from-blue-500 group-hover:to-blue-300 relative"
                  style={{ height: `${(count / maxVal) * 100}%`, minHeight: count > 0 ? '4px' : '0' }}
                >
                   {count > 0 && <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">{count}</span>}
                </div>
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(stats.last7Days[i]).getDay()]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution (Simulated Pie Chart via List) */}
        <div className="glass-card rounded-3xl p-8 border border-white/5">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 mb-8 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Focus Areas
          </h3>
          <div className="space-y-5">
            {stats.sortedCats.map(([cat, count]: any, i) => {
                const percentage = Math.round((count / tasks.length) * 100);
                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-white/80">{cat}</span>
                      <span className="text-gray-500">{percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 transition-all duration-1000" 
                        style={{ width: `${percentage}%`, transitionDelay: `${i * 100}ms` }}
                      ></div>
                    </div>
                  </div>
                );
            })}
            {stats.sortedCats.length === 0 && <p className="text-gray-600 text-sm italic">No data yet.</p>}
          </div>
        </div>
      </div>

      {/* AI Analysis Section */}
      <div className="glass-card rounded-[2.5rem] p-10 border border-white/5 bg-gradient-to-br from-blue-500/5 to-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-8">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tighter mb-2">Performance Insight</h2>
              <p className="text-gray-500 font-medium">Powered by Gemini Intelligence</p>
            </div>
            <div className="flex items-center gap-4 bg-white/5 px-6 py-4 rounded-3xl border border-white/10">
              <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Score</span>
              <span className="text-5xl font-black text-blue-500 tabular-nums">
                {loading ? '...' : insight?.score || 0}
              </span>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
              <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-3 block">Weekly Summary</label>
              <p className="text-lg text-white/90 leading-relaxed italic">
                {loading ? 'Generating analysis...' : insight?.summary || "Add more tasks to get a detailed summary of your workflow."}
              </p>
            </div>
            <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/10">
              <label className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-3 block">Strategic Advice</label>
              <p className="text-base text-gray-300 leading-relaxed font-medium">
                {loading ? 'Thinking...' : insight?.advice || "Keep capturing your tasks to reveal productivity patterns."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mock Mail Notification Subscribe */}
      <div className="glass-card rounded-3xl p-8 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-blue-500 border border-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </div>
          <div>
            <h4 className="text-white font-bold">Email Reports</h4>
            <p className="text-sm text-gray-500">Get this analysis delivered to your inbox every Sunday.</p>
          </div>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="email" 
            placeholder="your@email.com" 
            className="flex-1 md:w-64 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
};

export default Insights;
