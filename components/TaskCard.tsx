
import React from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete }) => {
  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`group glass-card rounded-2xl p-5 border-l-4 transition-all hover:bg-white/[0.03] ${
        task.priority === 'high' ? 'border-red-500' : 'border-blue-500'
    } ${task.completed ? 'opacity-40 grayscale' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <button 
            onClick={onToggle}
            className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                task.completed 
                ? 'bg-blue-500 border-blue-500' 
                : 'border-white/20 hover:border-blue-500'
            }`}
          >
            {task.completed && (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    {task.category}
                </span>
                <div className="flex gap-2">
                    <span className="text-[10px] text-blue-400/80 font-medium">Added: {formatDate(task.createdAt)}</span>
                    <span className="text-[10px] text-red-400/80 font-medium">End: {formatDate(task.dueDate)}</span>
                </div>
            </div>
            <p className={`text-lg font-medium leading-tight tracking-tight ${task.completed ? 'line-through text-gray-500' : 'text-white/90'}`}>
                {task.text}
            </p>
            
            {task.subtasks && task.subtasks.length > 0 && !task.completed && (
                <div className="mt-4 space-y-2 border-l border-white/5 pl-4 ml-1">
                    {task.subtasks.map((sub, i) => (
                        <div key={i} className="text-xs text-gray-400 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-red-500"></span>
                            {sub}
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>

        <button 
            onClick={onDelete}
            className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
