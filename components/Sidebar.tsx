import React from 'react';
import { CURRICULUM } from '../constants';
import { Module, Difficulty } from '../types';

interface SidebarProps {
  currentModule: Module;
  onSelectModule: (m: Module) => void;
  onSelectTopic: (t: string) => void;
  currentTopic: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ currentModule, onSelectModule, onSelectTopic, currentTopic }) => {
  
  const getDiffColor = (d: Difficulty) => {
    switch(d) {
      case Difficulty.BEGINNER: return 'text-green-400';
      case Difficulty.INTERMEDIATE: return 'text-yellow-400';
      case Difficulty.ADVANCED: return 'text-orange-400';
      case Difficulty.EXPERT: return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="w-80 h-full bg-slate-900 border-r border-slate-800 flex flex-col overflow-y-auto">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          QuantCademy
        </h1>
        <p className="text-xs text-slate-500 mt-1">Interactive Financial Engineering</p>
      </div>

      <div className="p-4 space-y-6">
        {CURRICULUM.map((module) => (
          <div key={module.id} className="group">
            <div 
              onClick={() => onSelectModule(module)}
              className={`cursor-pointer p-3 rounded-lg transition-all ${currentModule.id === module.id ? 'bg-slate-800' : 'hover:bg-slate-800/50'}`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${getDiffColor(module.difficulty)}`}>
                  {module.difficulty}
                </span>
              </div>
              <h3 className="font-semibold text-slate-200">{module.title}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{module.description}</p>
            </div>

            {/* Topics Dropdown (Only if active module) */}
            {currentModule.id === module.id && (
              <div className="mt-2 ml-4 space-y-1 border-l border-slate-700 pl-3">
                {module.topics.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => onSelectTopic(topic)}
                    className={`block w-full text-left text-sm py-1 px-2 rounded ${currentTopic === topic ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
