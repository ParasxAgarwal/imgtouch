import React from 'react';
import { ToolType } from '../types';

interface ToolboxProps {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
}

const TOOLS = [
  { id: ToolType.SELECT, icon: 'M3 15V3m0 0l5.55 5.55M3 3l12 12', label: 'Pointer' },
  { id: ToolType.TEXT, icon: 'M4 7V4h16v3M9 20h6M12 4v16', label: 'Type' },
  { id: ToolType.STICKER, icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z', label: 'Elements' },
  { id: ToolType.AI_GENERATE, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', label: 'Magic Gen' },
  { id: ToolType.AI_EDIT, icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z', label: 'AI Edit' },
  { id: ToolType.FILTERS, icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', label: 'Effects' },
];

const Toolbox: React.FC<ToolboxProps> = ({ activeTool, setActiveTool }) => {
  return (
    <aside className="
      flex md:flex-col items-center justify-around md:justify-start 
      w-full md:w-20 h-16 md:h-full md:py-6 md:gap-6 
      bg-z-black/95 md:glass-panel 
      border-t md:border-t-0 md:border-r border-white/10 
      z-50 pb-[env(safe-area-inset-bottom)] md:pb-0
    ">
      {TOOLS.map((tool) => {
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={`
              w-12 h-12 md:w-12 md:h-12 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 group relative
              ${isActive ? 'text-z-black' : 'text-gray-400 hover:bg-white/10 hover:text-white'}
            `}
            title={tool.label}
          >
            <div className={`
              absolute inset-0 rounded-2xl transition-opacity duration-300
              ${isActive ? 'bg-z-lime opacity-100 shadow-lg shadow-z-lime/20' : 'opacity-0'}
            `} />
            
            <div className="relative z-10 flex flex-col items-center">
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} />
                </svg>
                <span className={`text-[9px] mt-1 font-bold ${isActive ? 'text-z-black' : 'text-gray-500 group-hover:text-gray-300'}`}>
                {tool.label}
                </span>
            </div>
            
            {/* Active Indicator Desktop */}
            {isActive && (
              <div className="hidden md:block absolute -left-[1px] top-1/2 -translate-y-1/2 h-8 w-1 bg-white rounded-r-md" />
            )}
            {/* Active Indicator Mobile */}
            {isActive && (
              <div className="md:hidden absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-1 bg-white rounded-b-md" />
            )}
          </button>
        );
      })}
    </aside>
  );
};

export default Toolbox;