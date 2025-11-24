import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';

import TopNav from './components/TopNav';
import Toolbox from './components/Toolbox';
import PropertyBar from './components/PropertyBar';
import CanvasBoard from './components/CanvasBoard';
import Modal from './components/Modal';

import { ImageState, ToolType, TextLayer, Layer, ImageLayer } from './types';
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

  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.SELECT);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'generate' | 'edit'>('generate');
  const [aiLoading, setAiLoading] = useState(false);
  const [started, setStarted] = useState(false); 
  const [mobilePropertiesOpen, setMobilePropertiesOpen] = useState(false);

  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Auto-open property sheet on mobile when relevant tool is clicked
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

      setImageState(prev => ({
          ...prev,
          layers: [...prev.layers, newLayer],
          selectedLayerId: newLayer.id
      }));
      // Switch to select so user can immediately drag/edit
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
     
     setImageState(prev => ({
         ...prev,
         layers: [...prev.layers, newLayer],
         selectedLayerId: newLayer.id
     }));
     setActiveTool(ToolType.SELECT);
     setMobilePropertiesOpen(true);
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setImageState(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, ...updates } as Layer : l)
    }));
  };

  const deleteLayer = (id: string) => {
    setImageState(prev => ({
      ...prev,
      layers: prev.layers.filter(l => l.id !== id),
      selectedLayerId: null
    }));
    if (window.innerWidth < 768) setMobilePropertiesOpen(false);
  };

  const handleAspectRatioChange = (name: string) => {
     const ratio = ASPECT_RATIOS.find(r => r.name === name);
     
     if (name === 'default' && imageState.originalSize) {
         setImageState(prev => ({
             ...prev,
             canvasSize: { ...prev.originalSize! },
             aspectRatioName: 'default'
         }));
     } else if (ratio && name !== 'default') {
        setImageState(prev => ({
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
            setImageState(prev => ({
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
            setImageState(prev => ({
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
          setImageState(prev => ({
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
      setImageState({
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
            setImageState(prev => ({ 
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
    <div className="fixed inset-0 flex flex-col h-full w-full bg-z-black text-white overflow-hidden">
      <TopNav 
        onExport={handleExport} 
        onUpscale={handleUpscale}
        onReset={handleReset} 
        hasImage={hasContent} 
      />
      
      <div className="flex flex-1 overflow-hidden relative flex-col md:flex-row">
        {/* Desktop Toolbox Position */}
        <div className="hidden md:block h-full z-30">
          <Toolbox activeTool={activeTool} setActiveTool={handleToolChange} />
        </div>
        
        <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileUpload} />

        <main className="flex-1 relative flex flex-col bg-[#0a0a0a] overflow-hidden">
            {aiLoading && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center flex-col gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-z-cyan"></div>
                    <p className="text-z-cyan font-bold animate-pulse">Enhancing Image with AI...</p>
                </div>
            )}

            {!hasContent && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm px-4">
                    <div className="pointer-events-auto bg-z-panel p-6 md:p-8 rounded-2xl border border-white/10 shadow-2xl text-center max-w-lg w-full">
                        <h2 className="text-3xl md:text-4xl font-bebas mb-2 bg-gradient-to-r from-z-pink to-z-cyan bg-clip-text text-transparent">Touch Studio</h2>
                        <p className="text-gray-400 mb-8 text-sm md:text-base">Create professional designs in seconds.</p>
                        <div className="grid grid-cols-1 gap-3 md:gap-4">
                            <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 p-3 md:p-4 rounded-xl flex items-center gap-4 transition-all hover:border-z-cyan group">
                                <div className="w-10 h-10 rounded-full bg-z-cyan/20 flex items-center justify-center text-z-cyan group-hover:bg-z-cyan group-hover:text-black transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                                <div className="text-left"><div className="font-bold text-white text-sm md:text-base">Upload Photo</div><div className="text-xs text-gray-500">Start with your own base image</div></div>
                                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                            </label>
                            <button onClick={() => handleToolChange(ToolType.AI_GENERATE)} className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 md:p-4 rounded-xl flex items-center gap-4 transition-all hover:border-z-lime group">
                                <div className="w-10 h-10 rounded-full bg-z-lime/20 flex items-center justify-center text-z-lime group-hover:bg-z-lime group-hover:text-black transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
                                <div className="text-left"><div className="font-bold text-white text-sm md:text-base">AI Generate</div><div className="text-xs text-gray-500">Create a unique cover with Magic Gen</div></div>
                            </button>
                            <button onClick={handleStartBlank} className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 md:p-4 rounded-xl flex items-center gap-4 transition-all hover:border-z-pink group">
                                <div className="w-10 h-10 rounded-full bg-z-pink/20 flex items-center justify-center text-z-pink group-hover:bg-z-pink group-hover:text-white transition-colors"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg></div>
                                <div className="text-left"><div className="font-bold text-white text-sm md:text-base">Start Blank</div><div className="text-xs text-gray-500">Use solid colors or gradients</div></div>
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
            />
        </main>

        {/* Property Bar - Responsive Logic */}
        <PropertyBar 
            activeTool={activeTool}
            selectedLayer={imageState.layers.find(l => l.id === imageState.selectedLayerId) || null}
            onUpdateLayer={updateLayer}
            onDeleteLayer={deleteLayer}
            onAddSticker={handleAddSticker}
            onAddText={handleAddText}
            currentFilter={imageState.filterStr}
            onFilterChange={(f) => setImageState(prev => ({ ...prev, filterStr: f }))}
            onAspectRatioChange={handleAspectRatioChange}
            currentAspectRatio={imageState.aspectRatioName || 'custom'}
            mobileVisible={mobilePropertiesOpen}
            onCloseMobile={() => setMobilePropertiesOpen(false)}
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