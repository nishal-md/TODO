
import React, { useState, useRef, KeyboardEvent } from 'react';
import { Priority } from '../types';

interface PromptBoxProps {
  onAdd: (text: string, priority: Priority) => void;
  isLoading: boolean;
}

const PromptBox: React.FC<PromptBoxProps> = ({ onAdd, isLoading }) => {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onAdd(text, priority);
      setText('');
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const adjustHeight = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const element = e.target;
    element.style.height = 'auto';
    element.style.height = `${element.scrollHeight}px`;
    setText(element.value);
  };

  return (
    <div className="relative group w-full">
      <div className={`relative bg-[#1e1f20] rounded-3xl border border-white/5 focus-within:border-blue-500/50 p-6 transition-all duration-300 prompt-box-shadow min-h-[140px] flex flex-col justify-between ${isLoading ? 'opacity-70' : ''}`}>
        <textarea
          ref={inputRef}
          value={text}
          onChange={adjustHeight}
          onKeyDown={handleKeyDown}
          placeholder="Type your next task..."
          className="w-full bg-transparent border-none focus:ring-0 text-white text-xl placeholder-gray-600 resize-none px-2 py-2 min-h-[50px] max-h-[200px]"
          disabled={isLoading}
        />

        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            <button 
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-white/5 transition-colors"
              onClick={() => {
                  const cycle: Priority[] = ['low', 'medium', 'high'];
                  const next = cycle[(cycle.indexOf(priority) + 1) % 3];
                  setPriority(next);
              }}
            >
              <div className={`w-2 h-2 rounded-full ${priority === 'high' ? 'bg-red-500' : priority === 'medium' ? 'bg-blue-400' : 'bg-gray-600'}`}></div>
              {priority}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleSubmit}
              disabled={!text.trim() || isLoading}
              className={`px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                text.trim() && !isLoading 
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-95' 
                : 'bg-white/5 text-gray-700 cursor-not-allowed border border-white/5'
              }`}
            >
              {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : 'Add Task'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptBox;
