
import React, { useState } from 'react';
import { Task, Subtask } from '../types';

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onToggleSubtask: (subtaskId: string) => void;
  onAddSubtask: (text: string) => void;
  onEditSubtask: (subtaskId: string, newText: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onToggle, 
  onDelete,
  onToggleSubtask,
  onAddSubtask,
  onEditSubtask,
  onDeleteSubtask
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskText.trim()) {
      onAddSubtask(newSubtaskText.trim());
      setNewSubtaskText('');
    }
  };

  const startEditing = (sub: Subtask) => {
    setEditingSubtaskId(sub.id);
    setEditingText(sub.text);
  };

  const saveEdit = (subtaskId: string) => {
    if (editingText.trim()) {
      onEditSubtask(subtaskId, editingText.trim());
    }
    setEditingSubtaskId(null);
  };

  const completedCount = (task.subtasks || []).filter(s => s.completed).length;
  const totalCount = (task.subtasks || []).length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className={`group glass-card rounded-2xl p-5 border-l-4 transition-all duration-500 ease-in-out hover:bg-white/[0.03] ${
        task.priority === 'high' ? 'border-red-500' : 'border-blue-500'
    } ${task.completed ? 'opacity-40 grayscale scale-[0.98]' : 'scale-100 opacity-100'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <button 
            onClick={onToggle}
            className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center transform active:scale-90 ${
                task.completed 
                ? 'bg-blue-500 border-blue-500 rotate-0' 
                : 'border-white/20 hover:border-blue-500 rotate-[-15deg]'
            }`}
          >
            <div className={`transition-all duration-300 transform ${task.completed ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
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
            
            <div className="flex items-center gap-2 group/title">
              <p className={`text-lg font-bold leading-tight tracking-tight transition-all duration-500 flex-1 ${task.completed ? 'line-through text-gray-500 italic' : 'text-white/90'}`}>
                  {task.text}
              </p>
              {totalCount > 0 && (
                <button 
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className={`p-1 hover:bg-white/5 rounded-md transition-all ${isCollapsed ? 'rotate-[-90deg]' : 'rotate-0'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
              )}
            </div>

            {totalCount > 0 && !task.completed && (
              <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-700 ${progress === 100 ? 'bg-blue-500' : 'bg-red-500'}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
            
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${task.completed || isCollapsed ? 'max-h-0 opacity-0 mt-0' : 'max-h-[1000px] opacity-100 mt-5'}`}>
              <div className="space-y-3 border-l border-white/5 pl-4 ml-1">
                {(task.subtasks || []).map((sub) => (
                  <div key={sub.id} className="flex items-center gap-3 group/subtask">
                    <button 
                      onClick={() => onToggleSubtask(sub.id)}
                      className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                        sub.completed ? 'bg-red-500 border-red-500' : 'border-white/20 hover:border-red-500/50'
                      }`}
                    >
                      {sub.completed && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      )}
                    </button>
                    
                    {editingSubtaskId === sub.id ? (
                      <input 
                        autoFocus
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => saveEdit(sub.id)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit(sub.id)}
                        className="flex-1 bg-white/5 border-none rounded px-2 py-0.5 text-xs text-white focus:ring-1 focus:ring-blue-500 outline-none"
                      />
                    ) : (
                      <span 
                        onClick={() => startEditing(sub)}
                        className={`text-xs flex-1 transition-all ${sub.completed ? 'line-through text-gray-600' : 'text-gray-400 hover:text-white cursor-text'}`}
                      >
                        {sub.text}
                      </span>
                    )}

                    <button 
                      onClick={() => onDeleteSubtask(sub.id)}
                      className="opacity-0 group-hover/subtask:opacity-100 p-1 text-gray-600 hover:text-red-500 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                ))}

                <form onSubmit={handleAddSubtask} className="pt-2">
                  <input 
                    type="text"
                    placeholder="+ Add subtask..."
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                    className="w-full bg-transparent border-none text-xs text-blue-400 placeholder-gray-700 p-0 focus:ring-0 outline-none"
                  />
                </form>
              </div>
            </div>
          </div>
        </div>

        <button 
            onClick={onDelete}
            className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
