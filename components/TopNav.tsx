import React from 'react';

interface TopNavProps {
  onExport: () => void;
  onUpscale: () => void;
  onReset: () => void;
  hasImage: boolean;
}

const TopNav: React.FC<TopNavProps> = ({ onExport, onUpscale, onReset, hasImage }) => {
  return (
    <header className="h-14 md:h-16 w-full glass-panel flex items-center justify-between px-4 md:px-6 z-50 sticky top-0 shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-z-lime to-z-cyan flex items-center justify-center font-bold text-z-black text-lg md:text-xl font-bebas">
          iT
        </div>
        <h1 className="text-lg md:text-2xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 font-bebas hidden sm:block">
          imgtouch
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button 
          onClick={onReset}
          className="p-2 md:px-4 md:py-2 rounded-full text-xs font-semibold text-gray-400 hover:text-white transition-colors uppercase tracking-widest flex items-center justify-center"
          title="Reset"
        >
          <span className="hidden md:inline">Reset</span>
          <svg className="w-5 h-5 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
        
        <button 
          onClick={onUpscale}
          disabled={!hasImage}
          className={`
            p-2 md:px-5 md:py-2 rounded-full font-bold text-xs transition-all border border-z-cyan/30 flex items-center gap-2
            ${hasImage 
              ? 'text-z-cyan hover:bg-z-cyan/10 hover:shadow-[0_0_15px_rgba(0,247,255,0.3)]' 
              : 'text-gray-600 cursor-not-allowed'}
          `}
          title="AI Enhance"
        >
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
           <span className="hidden md:inline">AI Enhance</span>
        </button>

        <button 
          onClick={onExport}
          disabled={!hasImage}
          className={`
            px-4 md:px-6 py-2 rounded-full font-bold text-xs md:text-sm transition-all shadow-lg shadow-z-pink/20 flex items-center gap-2
            ${hasImage 
              ? 'bg-gradient-to-r from-z-pink to-z-violet text-white hover:scale-105 hover:shadow-z-pink/40' 
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
          `}
        >
          <span>Export</span>
          <svg className="w-4 h-4 hidden md:block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12" /></svg>
        </button>
      </div>
    </header>
  );
};

export default TopNav;