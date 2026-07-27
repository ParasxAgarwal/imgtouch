import React, { useState } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  title: string;
  loading: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, title, loading }) => {
  const [prompt, setPrompt] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-g-dark-surface border border-gray-200 dark:border-g-dark-border rounded-2xl w-full max-w-md p-6 shadow-xl relative overflow-hidden transition-colors duration-200">
        
        <h2 className="text-2xl font-sans font-extrabold text-g-text dark:text-g-dark-text mb-2">{title}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Describe what you want to create. Be specific for better results!</p>
        
        <textarea
          autoFocus
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A photorealistic landscape of the rocky mountains..."
          className="w-full h-32 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-g-dark-border rounded-xl p-4 text-g-text dark:text-g-dark-text focus:border-g-blue focus:ring-1 focus:ring-g-blue outline-none resize-none mb-6 text-sm"
        />

        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onSubmit(prompt)}
            disabled={loading || !prompt.trim()}
            className="px-6 py-2 bg-g-blue rounded-full text-white text-sm font-bold shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
