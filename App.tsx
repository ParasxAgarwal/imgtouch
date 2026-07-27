import React, { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';

import TopNav from './components/TopNav';
import Toolbox from './components/Toolbox';
import PropertyBar from './components/PropertyBar';
import CanvasBoard from './components/CanvasBoard';
import Modal from './components/Modal';

import { ImageState, ToolType, TextLayer, Layer, ImageLayer, TemplatePreset } from './types';
import { DEFAULT_TEXT_LAYER, ASPECT_RATIOS } from './constants';
import { generateImageWithGemini, editImageWithGemini, enhanceImageWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [imageState, setImageState] = useState<ImageState>({
    backgroundUrl: null,
    layers: [],
    selectedLayerId: null,
    canvasSize: { width: 800, height: 600 },
    aspectRatioName: 'custom',
    filterStr: 'none'
  });

  // Undo / Redo History Stacks
  const [undoStack, setUndoStack] = useState<ImageState[]>([]);
  const [redoStack, setRedoStack] = useState<ImageState[]>([]);

  // Canvas Zoom Scale
  const [zoomScale, setZoomScale] = useState<number>(1.0);

  // Resizable Sidebar Width
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = localStorage.getItem('sidebarWidth');
    return saved ? Math.max(260, Math.min(560, Number(saved))) : 350;
  });

  const handleSidebarResize = (newWidth: number) => {
    setSidebarWidth(newWidth);
    localStorage.setItem('sidebarWidth', String(newWidth));
  };

  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.SELECT);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'generate' | 'edit'>('generate');
  const [aiLoading, setAiLoading] = useState(false);
  const [started, setStarted] = useState(false); 
  const [mobilePropertiesOpen, setMobilePropertiesOpen] = useState(false);

  // Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(prev => !prev);

  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Helper to commit state changes to history stack
  const updateStateWithHistory = useCallback((nextStateOrFn: ImageState | ((prev: ImageState) => ImageState)) => {
    setImageState((prev) => {
      const next = typeof nextStateOrFn === 'function' ? nextStateOrFn(prev) : nextStateOrFn;
      setUndoStack((history) => [...history.slice(-30), prev]);
      setRedoStack([]);
      return next;
    });
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((stack) => stack.slice(0, -1));
    setRedoStack((stack) => [...stack, imageState]);
    setImageState(previous);
  }, [undoStack, imageState]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((stack) => stack.slice(0, -1));
    setUndoStack((stack) => [...stack, imageState]);
    setImageState(next);
  }, [redoStack, imageState]);

  // Keyboard Shortcuts (Ctrl+Z / Cmd+Z, Ctrl+Y / Cmd+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  useEffect(() => {
    if (window.innerWidth < 768) {
        if (imageState.selectedLayerId || (activeTool !== ToolType.SELECT && activeTool !== ToolType.AI_GENERATE)) {
            setMobilePropertiesOpen(true);
        } else {
            setMobilePropertiesOpen(false);
        }
    }
  }, [imageState.selectedLayerId, activeTool]);

  const handleToolChange = (tool: ToolType) => {
    setActiveTool(tool);
    if (tool === ToolType.AI_GENERATE) {
      setModalMode('generate');
      setModalOpen(true);
    } else if (tool === ToolType.AI_EDIT) {
      if (!imageState.backgroundUrl) {
        alert("Please upload or generate an image first to edit it.");
        return;
      }
      setModalMode('edit');
      setModalOpen(true);
    } else if (tool === ToolType.SELECT) {
        setImageState(prev => ({ ...prev, selectedLayerId: null }));
        if(window.innerWidth < 768) setMobilePropertiesOpen(false);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (activeTool === ToolType.TEXT) {
      const x = e.nativeEvent.offsetX;
      const y = e.nativeEvent.offsetY;
      handleAddText(undefined, x, y);
    }
  };

  const handleAddText = (style?: Partial<TextLayer>, x?: number, y?: number) => {
      const newLayer: TextLayer = {
          ...DEFAULT_TEXT_LAYER,
          ...style,
          id: uuidv4(),
          type: 'text',
          x: x || (imageState.canvasSize.width / 2 - 100),
          y: y || (imageState.canvasSize.height / 2 - 40),
      };

      updateStateWithHistory((prev) => ({
          ...prev,
          layers: [...prev.layers, newLayer],
          selectedLayerId: newLayer.id
      }));
      setActiveTool(ToolType.SELECT);
      setMobilePropertiesOpen(true);
  };

  const handleAddSticker = (url: string) => {
     const newLayer: ImageLayer = {
         id: uuidv4(),
         type: 'image',
         src: url,
         x: imageState.canvasSize.width / 2 - 75,
         y: imageState.canvasSize.height / 2 - 75,
         width: 150,
         height: 150,
         rotation: 0,
         opacity: 1
     };
     
     updateStateWithHistory((prev) => ({
         ...prev,
         layers: [...prev.layers, newLayer],
         selectedLayerId: newLayer.id
     }));
     setActiveTool(ToolType.SELECT);
     setMobilePropertiesOpen(true);
  };

  const handleApplyTemplate = (template: TemplatePreset) => {
    const populatedLayers: Layer[] = template.layers.map((layer) => ({
      ...layer,
      id: uuidv4(),
    })) as Layer[];

    updateStateWithHistory({
      backgroundUrl: template.backgroundUrl || null,
      layers: populatedLayers,
      selectedLayerId: populatedLayers[0]?.id || null,
      canvasSize: { ...template.canvasSize },
      aspectRatioName: template.aspectRatioName,
      filterStr: 'none'
    });
    setStarted(true);
    setActiveTool(ToolType.SELECT);
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setImageState(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, ...updates } as Layer : l)
    }));
  };

  const deleteLayer = (id: string) => {
    updateStateWithHistory((prev) => ({
      ...prev,
      layers: prev.layers.filter(l => l.id !== id),
      selectedLayerId: null
    }));
    if (window.innerWidth < 768) setMobilePropertiesOpen(false);
  };

  const handleReorderLayer = (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
    updateStateWithHistory((prev) => {
      const idx = prev.layers.findIndex((l) => l.id === id);
      if (idx === -1) return prev;
      const newLayers = [...prev.layers];
      const [moved] = newLayers.splice(idx, 1);

      if (direction === 'top') newLayers.push(moved);
      else if (direction === 'bottom') newLayers.unshift(moved);
      else if (direction === 'up') newLayers.splice(Math.min(newLayers.length, idx + 1), 0, moved);
      else if (direction === 'down') newLayers.splice(Math.max(0, idx - 1), 0, moved);

      return { ...prev, layers: newLayers };
    });
  };

  const handleDuplicateLayer = (id: string) => {
    const target = imageState.layers.find((l) => l.id === id);
    if (!target) return;
    const clone: Layer = {
      ...target,
      id: uuidv4(),
      x: target.x + 20,
      y: target.y + 20,
    } as Layer;

    updateStateWithHistory((prev) => ({
      ...prev,
      layers: [...prev.layers, clone],
      selectedLayerId: clone.id
    }));
  };

  const handleAspectRatioChange = (name: string) => {
     const ratio = ASPECT_RATIOS.find(r => r.name === name);
     
     if (name === 'default' && imageState.originalSize) {
         updateStateWithHistory(prev => ({
             ...prev,
             canvasSize: { ...prev.originalSize! },
             aspectRatioName: 'default'
         }));
     } else if (ratio && name !== 'default') {
        updateStateWithHistory(prev => ({
            ...prev,
            canvasSize: { width: ratio.width, height: ratio.height },
            aspectRatioName: name
        }));
     }
  };

  const handleAIRequest = async (prompt: string) => {
    setAiLoading(true);
    try {
      if (modalMode === 'generate') {
        const base64 = await generateImageWithGemini(prompt);
        const img = new Image();
        img.onload = () => {
            updateStateWithHistory(prev => ({
               ...prev,
               backgroundUrl: base64,
               canvasSize: { width: img.width, height: img.height },
               originalSize: { width: img.width, height: img.height },
               aspectRatioName: 'default',
               filterStr: 'none' 
            }));
            setStarted(true);
        };
        img.src = base64;
      } else {
        if (imageState.backgroundUrl) {
            const newBase64 = await editImageWithGemini(imageState.backgroundUrl, prompt);
            updateStateWithHistory(prev => ({
                ...prev,
                backgroundUrl: newBase64
            }));
        }
      }
      setModalOpen(false);
    } catch (error) {
      alert("AI Error: " + (error as Error).message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;
    try {
      const canvas = await html2canvas(canvasRef.current, {
        useCORS: true,
        backgroundColor: null,
        scale: 4, 
        ignoreElements: (element) => element.classList.contains('ui-handle')
      });
      const link = document.createElement('a');
      link.download = `imgtouch-HD-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Export failed", err);
      alert("Failed to export image.");
    }
  };

  const handleUpscale = async () => {
      if (!imageState.backgroundUrl) return;
      const confirm = window.confirm("Use AI to enhance image clarity and details (Super Resolution)?\nThis keeps the layout but hallucinates sharper details.");
      if (!confirm) return;

      setAiLoading(true);
      try {
          const enhancedUrl = await enhanceImageWithGemini(imageState.backgroundUrl);
          updateStateWithHistory(prev => ({
              ...prev,
              backgroundUrl: enhancedUrl
          }));
          alert("Image Enhanced successfully!");
      } catch (e) {
          alert("Enhancement failed: " + (e as Error).message);
      } finally {
          setAiLoading(false);
      }
  };

  const handleReset = () => {
    if(window.confirm("Clear workspace?")) {
      updateStateWithHistory({
        backgroundUrl: null,
        layers: [],
        selectedLayerId: null,
        canvasSize: { width: 800, height: 600 },
        aspectRatioName: 'custom',
        filterStr: 'none'
      });
      setStarted(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        const img = new Image();
        img.onload = () => {
            updateStateWithHistory(prev => ({ 
                ...prev, 
                backgroundUrl: result,
                canvasSize: { width: img.width, height: img.height },
                originalSize: { width: img.width, height: img.height },
                aspectRatioName: 'default'
            }));
            setStarted(true);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartBlank = () => {
      setStarted(true);
      handleAspectRatioChange('novel');
  };

  const hasContent = started || !!imageState.backgroundUrl || imageState.layers.length > 0;

  return (
    <div className="fixed inset-0 flex flex-col h-full w-full bg-g-bg dark:bg-g-dark-bg text-g-text dark:text-g-dark-text overflow-hidden transition-colors duration-200">
      <TopNav 
        onExport={handleExport} 
        onUpscale={handleUpscale}
        onReset={handleReset} 
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        hasImage={hasContent} 
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />
      
      <div className="flex flex-1 overflow-hidden relative flex-col md:flex-row">
        {/* Desktop Toolbox Position */}
        <div className="hidden md:block h-full z-30">
          <Toolbox activeTool={activeTool} setActiveTool={handleToolChange} />
        </div>
        
        <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileUpload} />

        <main className="flex-1 relative flex flex-col bg-g-bg dark:bg-g-dark-bg overflow-hidden transition-colors duration-200">
            {aiLoading && (
                <div className="absolute inset-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center flex-col gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-g-blue"></div>
                    <p className="text-g-blue dark:text-g-blue-light font-bold animate-pulse text-base">Enhancing Image with AI...</p>
                </div>
            )}

            {!hasContent && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-50/90 dark:bg-g-dark-bg/95 backdrop-blur-md px-4">
                    <div className="pointer-events-auto bg-white dark:bg-g-dark-surface p-8 md:p-10 rounded-3xl border border-gray-200 dark:border-g-dark-border shadow-2xl text-center max-w-lg w-full transition-all duration-200">
                        <div className="w-12 h-12 rounded-2xl bg-g-blue/10 dark:bg-g-blue/20 text-g-blue dark:text-g-blue-light flex items-center justify-center mx-auto mb-4 font-bold text-xl">iT</div>
                        <h2 className="text-3xl md:text-4xl font-sans font-extrabold mb-2 text-g-text dark:text-g-dark-text tracking-tight">Touch Studio</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm md:text-base font-medium">Create professional, high-res designs in seconds.</p>
                        <div className="grid grid-cols-1 gap-3 md:gap-4">
                            <label className="cursor-pointer bg-gray-50 dark:bg-g-dark-card hover:bg-blue-50/60 dark:hover:bg-gray-700/60 border border-gray-200 dark:border-g-dark-border p-4 rounded-2xl flex items-center gap-4 transition-all hover:border-g-blue dark:hover:border-g-blue-light group shadow-sm hover:shadow-md">
                                <div className="w-11 h-11 rounded-xl bg-blue-500/10 dark:bg-g-blue/20 flex items-center justify-center text-g-blue dark:text-g-blue-light group-hover:bg-g-blue group-hover:text-white transition-colors shrink-0">
                                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                </div>
                                <div className="text-left"><div className="font-bold text-gray-900 dark:text-g-dark-text text-sm md:text-base">Upload Photo</div><div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Start with your own base image</div></div>
                                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                            </label>
                            <button onClick={() => handleToolChange(ToolType.AI_GENERATE)} className="bg-gray-50 dark:bg-g-dark-card hover:bg-green-50/60 dark:hover:bg-gray-700/60 border border-gray-200 dark:border-g-dark-border p-4 rounded-2xl flex items-center gap-4 transition-all hover:border-g-green dark:hover:border-g-green group shadow-sm hover:shadow-md">
                                <div className="w-11 h-11 rounded-xl bg-green-500/10 dark:bg-g-green/20 flex items-center justify-center text-g-green group-hover:bg-g-green group-hover:text-white transition-colors shrink-0">
                                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                </div>
                                <div className="text-left"><div className="font-bold text-gray-900 dark:text-g-dark-text text-sm md:text-base">AI Generate</div><div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Create a unique cover with Magic Gen</div></div>
                            </button>
                            <button onClick={handleStartBlank} className="bg-gray-50 dark:bg-g-dark-card hover:bg-yellow-50/60 dark:hover:bg-gray-700/60 border border-gray-200 dark:border-g-dark-border p-4 rounded-2xl flex items-center gap-4 transition-all hover:border-g-yellow dark:hover:border-g-yellow group shadow-sm hover:shadow-md">
                                <div className="w-11 h-11 rounded-xl bg-yellow-500/10 dark:bg-g-yellow/20 flex items-center justify-center text-g-yellow group-hover:bg-g-yellow group-hover:text-white transition-colors shrink-0">
                                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                </div>
                                <div className="text-left"><div className="font-bold text-gray-900 dark:text-g-dark-text text-sm md:text-base">Start Blank</div><div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Use solid colors or custom canvas ratio</div></div>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <CanvasBoard 
                imageState={imageState}
                onLayerSelect={(id) => setImageState(prev => ({ ...prev, selectedLayerId: id }))}
                onLayerUpdate={updateLayer}
                activeTool={activeTool}
                onCanvasClick={handleCanvasClick}
                setCanvasRef={(ref) => canvasRef.current = ref}
                zoomScale={zoomScale}
                onZoomChange={setZoomScale}
            />
        </main>

        {/* Property Bar - Responsive & Resizable */}
        <PropertyBar 
            activeTool={activeTool}
            selectedLayer={imageState.layers.find(l => l.id === imageState.selectedLayerId) || null}
            onUpdateLayer={updateLayer}
            onDeleteLayer={deleteLayer}
            onReorderLayer={handleReorderLayer}
            onDuplicateLayer={handleDuplicateLayer}
            onAddSticker={handleAddSticker}
            onAddText={handleAddText}
            onApplyTemplate={handleApplyTemplate}
            currentFilter={imageState.filterStr}
            onFilterChange={(f) => setImageState(prev => ({ ...prev, filterStr: f }))}
            onAspectRatioChange={handleAspectRatioChange}
            currentAspectRatio={imageState.aspectRatioName || 'custom'}
            mobileVisible={mobilePropertiesOpen}
            onCloseMobile={() => setMobilePropertiesOpen(false)}
            sidebarWidth={sidebarWidth}
            onSidebarResize={handleSidebarResize}
        />

        {/* Mobile Toolbox (Fixed Bottom) */}
        <div className="md:hidden w-full z-50">
             <Toolbox activeTool={activeTool} setActiveTool={handleToolChange} />
        </div>
      </div>

      <Modal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAIRequest}
        title={modalMode === 'generate' ? 'Magic Generator' : 'Magic Edit'}
        loading={aiLoading}
      />
    </div>
  );
};

export default App;