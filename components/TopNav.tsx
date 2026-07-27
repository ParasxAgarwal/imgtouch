import React from 'react';

interface TopNavProps {
  onExport: () => void;
  onUpscale: () => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasImage: boolean;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const TopNav: React.FC<TopNavProps> = ({
  onExport,
  onUpscale,
  onReset,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  hasImage,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="h-14 md:h-16 w-full bg-white dark:bg-g-dark-surface border-b border-gray-200 dark:border-g-dark-border flex items-center justify-between px-4 md:px-6 z-50 sticky top-0 shrink-0 transition-colors duration-200 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl bg-g-blue flex items-center justify-center font-bold text-white text-lg md:text-xl font-sans shadow-md shadow-blue-500/20">
          iT
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg md:text-xl font-extrabold tracking-tight text-g-text dark:text-g-dark-text font-sans hidden sm:block leading-none">
            imgtouch
          </h1>
          <span className="text-[10px] text-gray-400 dark:text-gray-400 font-medium hidden sm:block">AI Studio</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 md:gap-3">
        {/* Undo & Redo Buttons */}
        <div className="flex items-center bg-gray-50 dark:bg-g-dark-card border border-gray-200 dark:border-g-dark-border rounded-xl p-0.5">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 md:px-2.5 md:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              canUndo
                ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-700'
                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            <span className="hidden lg:inline text-[11px]">Undo</span>
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 md:px-2.5 md:py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              canRedo
                ? 'text-gray-700 dark:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-700'
                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m16-10l-6 6m6-6l-6-6" />
            </svg>
            <span className="hidden lg:inline text-[11px]">Redo</span>
          </button>
        </div>

        {/* Dark Mode Toggle Button */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 md:px-3 md:py-2 rounded-xl border border-gray-200 dark:border-g-dark-border bg-gray-50 dark:bg-g-dark-card text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center gap-2 text-xs font-semibold"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? (
            <>
              <svg className="w-4 h-4 text-g-yellow" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 2.78a1 1 0 011.415 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zm2.83 7.07a1 1 0 010 1.415l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-2.78 4.22a1 1 0 010 1.415l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.415 0zM11 17a1 1 0 100 2v-1a1 1 0 100-2zm-4.22-1.78a1 1 0 01-1.415 0l-.707-.707a1 1 0 011.414-1.414l.707.707a1 1 0 010 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1zm2.78-4.22a1 1 0 010-1.415l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zM10 6a4 4 0 100 8 4 4 0 000-8z" clipRule="evenodd" />
              </svg>
              <span className="hidden md:inline text-g-yellow font-bold">Light</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
              <span className="hidden md:inline font-bold">Dark</span>
            </>
          )}
        </button>

        <button 
          onClick={onReset}
          className="p-2 md:px-3 md:py-2 rounded-xl border border-gray-200 dark:border-g-dark-border bg-gray-50 dark:bg-g-dark-card text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-g-text dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-all uppercase tracking-wider flex items-center justify-center"
          title="Reset Canvas"
        >
          <span className="hidden md:inline">Reset</span>
          <svg className="w-4 h-4 md:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
        
        <button 
          onClick={onUpscale}
          disabled={!hasImage}
          className={`
            p-2 md:px-4 md:py-2 rounded-xl font-bold text-xs transition-all border flex items-center gap-2
            ${hasImage 
              ? 'border-g-blue/50 text-g-blue dark:text-g-blue-light bg-blue-50 dark:bg-g-blue/15 hover:bg-blue-100 dark:hover:bg-g-blue/30 shadow-sm' 
              : 'border-gray-200 dark:border-g-dark-border text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-g-dark-card/50 cursor-not-allowed'}
          `}
          title="AI Enhance Image Clarity"
        >
           <svg className="w-4 h-4 text-g-blue dark:text-g-blue-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
           <span className="hidden md:inline">AI Enhance</span>
        </button>

        <button 
          onClick={onExport}
          disabled={!hasImage}
          className={`
            px-4 md:px-5 py-2 rounded-xl font-bold text-xs md:text-sm transition-all shadow flex items-center gap-2
            ${hasImage 
              ? 'bg-g-blue text-white hover:bg-blue-700 hover:shadow-md active:scale-95' 
              : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'}
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