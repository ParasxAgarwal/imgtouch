import React, { useState, useEffect, useCallback } from 'react';
import { ToolType, Layer, TextLayer, ImageLayer, TemplatePreset } from '../types';
import { FONTS, TEXT_PRESETS, ASPECT_RATIOS, STICKER_PRESETS, TEMPLATE_PRESETS } from '../constants';
import { generateCreativeText } from '../services/geminiService';

interface PropertyBarProps {
  activeTool: ToolType;
  selectedLayer: Layer | null;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onDeleteLayer: (id: string) => void;
  onReorderLayer: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  onDuplicateLayer: (id: string) => void;
  onAddSticker: (url: string) => void;
  onAddText: (style?: Partial<TextLayer>) => void;
  onApplyTemplate: (template: TemplatePreset) => void;
  onFilterChange: (filter: string) => void;
  currentFilter: string;
  onAspectRatioChange: (name: string) => void;
  currentAspectRatio: string;
  mobileVisible: boolean;
  onCloseMobile: () => void;
  sidebarWidth: number;
  onSidebarResize: (newWidth: number) => void;
}

const PropertyBar: React.FC<PropertyBarProps> = ({
  activeTool,
  selectedLayer,
  onUpdateLayer,
  onDeleteLayer,
  onReorderLayer,
  onDuplicateLayer,
  onAddSticker,
  onAddText,
  onApplyTemplate,
  onFilterChange,
  currentFilter,
  onAspectRatioChange,
  currentAspectRatio,
  mobileVisible,
  onCloseMobile,
  sidebarWidth,
  onSidebarResize,
}) => {
  const [suggestionTopic, setSuggestionTopic] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  
  const [activeTab, setActiveTab] = useState<'design' | 'canvas'>('canvas');
  const [isDraggingResizer, setIsDraggingResizer] = useState(false);

  useEffect(() => {
    if (selectedLayer || activeTool === ToolType.TEXT || activeTool === ToolType.STICKER || activeTool === ToolType.TEMPLATES) {
      setActiveTab('design');
    } else {
      setActiveTab('canvas');
    }
  }, [selectedLayer, activeTool]);

  // Sidebar Drag Resizer Logic
  const handleMouseDownResizer = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingResizer(true);
  };

  const handleMouseMoveResizer = useCallback((e: MouseEvent) => {
    if (!isDraggingResizer) return;
    const newWidth = Math.max(260, Math.min(560, window.innerWidth - e.clientX));
    onSidebarResize(newWidth);
  }, [isDraggingResizer, onSidebarResize]);

  const handleMouseUpResizer = useCallback(() => {
    setIsDraggingResizer(false);
  }, []);

  useEffect(() => {
    if (isDraggingResizer) {
      window.addEventListener('mousemove', handleMouseMoveResizer);
      window.addEventListener('mouseup', handleMouseUpResizer);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveResizer);
      window.removeEventListener('mouseup', handleMouseUpResizer);
    };
  }, [isDraggingResizer, handleMouseMoveResizer, handleMouseUpResizer]);

  const handleGenerateText = async () => {
    if (!suggestionTopic) return;
    setLoadingSuggestions(true);
    const results = await generateCreativeText(suggestionTopic);
    setSuggestions(results);
    setLoadingSuggestions(false);
  };

  const applySuggestion = (text: string) => {
    if (selectedLayer && selectedLayer.type === 'text') {
      onUpdateLayer(selectedLayer.id, { text });
    } else {
        onAddText({ text });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        onAddSticker(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderDesignTab = () => {
    if (activeTool === ToolType.TEMPLATES) {
      return (
        <div className="flex flex-col gap-5 p-5 md:p-6 overflow-y-auto h-full scrollbar-hide pb-20 md:pb-24">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-g-text dark:text-g-dark-text hidden md:block">Design Patterns</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click any layout pattern to populate your canvas instantly.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-3.5 mt-1">
            {TEMPLATE_PRESETS.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => onApplyTemplate(tmpl)}
                className="group border border-gray-200 dark:border-g-dark-border bg-gray-50 dark:bg-g-dark-card rounded-2xl p-4 text-left transition-all hover:border-g-blue dark:hover:border-g-blue-light hover:shadow-md relative overflow-hidden"
              >
                <div 
                  className="w-full h-20 rounded-xl mb-3 flex items-center justify-center text-white font-bold text-sm shadow-inner opacity-90 group-hover:opacity-100 transition-opacity"
                  style={{ background: tmpl.previewGradient }}
                >
                  <span className="bg-black/30 backdrop-blur-sm px-3.5 py-1 rounded-full text-xs font-semibold">{tmpl.category}</span>
                </div>
                <h3 className="font-bold text-sm md:text-base text-gray-900 dark:text-g-dark-text group-hover:text-g-blue dark:group-hover:text-g-blue-light transition-colors">{tmpl.name}</h3>
                <span className="text-xs text-gray-400 font-mono mt-1 block">{tmpl.canvasSize.width} × {tmpl.canvasSize.height} ({tmpl.aspectRatioName})</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (activeTool === ToolType.STICKER) {
        return (
            <div className="flex flex-col gap-5 p-5 md:p-6 overflow-y-auto h-full scrollbar-hide pb-20 md:pb-24">
                <h2 className="text-xl font-extrabold tracking-tight text-g-text dark:text-g-dark-text hidden md:block">Elements & Stickers</h2>
                <div className="flex flex-col gap-2.5">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Custom Upload</label>
                    <label className="flex items-center justify-center gap-2 w-full border border-dashed border-gray-300 dark:border-g-dark-border rounded-2xl p-3.5 bg-gray-50 dark:bg-g-dark-card hover:bg-blue-50 dark:hover:bg-g-blue/15 hover:border-g-blue cursor-pointer transition-all">
                        <svg className="w-5 h-5 text-g-blue dark:text-g-blue-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Upload Image Element</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                    <div className="flex gap-2 mt-1">
                        <input type="text" placeholder="Paste image URL..." className="flex-1 bg-gray-50 dark:bg-g-dark-card text-xs p-3 rounded-xl border border-gray-200 dark:border-g-dark-border text-gray-900 dark:text-g-dark-text outline-none focus:border-g-blue transition-all" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} />
                        <button onClick={() => { if(customUrl) { onAddSticker(customUrl); setCustomUrl(''); }}} className="bg-g-blue text-white text-xs font-bold px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">Add</button>
                    </div>
                </div>
                <hr className="border-gray-100 dark:border-g-dark-border" />
                <div className="grid grid-cols-4 md:grid-cols-3 gap-2.5">
                    {STICKER_PRESETS.map((sticker, idx) => (
                        <button key={idx} onClick={() => onAddSticker(sticker.url)} className="aspect-square bg-gray-50 dark:bg-g-dark-card border border-gray-200 dark:border-g-dark-border rounded-xl p-2.5 hover:border-g-blue dark:hover:border-g-blue-light hover:shadow-md transition-all group flex items-center justify-center">
                            <img src={sticker.url} alt={sticker.label} className="w-full h-full object-contain opacity-85 group-hover:opacity-100 dark:invert" />
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (!selectedLayer || activeTool === ToolType.TEXT) {
        return (
            <div className="flex flex-col gap-5 p-5 md:p-6 overflow-y-auto h-full scrollbar-hide pb-20 md:pb-24">
                <h2 className="text-xl font-extrabold tracking-tight text-g-text dark:text-g-dark-text hidden md:block">Add Text Layer</h2>
                <div className="bg-blue-50/80 dark:bg-g-blue/10 p-4 rounded-2xl border border-blue-100 dark:border-g-blue/20">
                    <button onClick={() => onAddText()} className="w-full py-3 bg-g-blue text-white font-bold rounded-xl shadow-md hover:bg-blue-700 active:scale-98 transition-all text-xs md:text-sm flex items-center justify-center gap-2">
                        <span>+ Add Heading Text</span>
                    </button>
                </div>
                
                <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pro Text Styles</label>
                    <div className="grid grid-cols-2 gap-3">
                        {TEXT_PRESETS.map(preset => (
                            <button
                                key={preset.name}
                                onClick={() => onAddText(preset.style)}
                                className={`bg-gray-50 dark:bg-g-dark-card border border-gray-200 dark:border-g-dark-border rounded-2xl p-3 hover:border-g-blue dark:hover:border-g-blue-light hover:shadow-md transition-all text-center group relative overflow-hidden h-20 md:h-24 flex items-center justify-center`}
                            >
                                <span className={`text-sm md:text-base font-bold ${preset.style.fontFamily} relative z-10`} style={{
                                    color: preset.style.color,
                                    background: preset.style.gradient || 'transparent',
                                    WebkitBackgroundClip: preset.style.gradient ? 'text' : undefined,
                                    WebkitTextFillColor: preset.style.gradient ? 'transparent' : undefined,
                                }}>
                                    {preset.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5 p-5 md:p-6 overflow-y-auto h-full scrollbar-hide pb-20 md:pb-24">
          <div className="flex justify-between items-center">
             <h2 className="text-xl font-extrabold tracking-tight text-g-text dark:text-g-dark-text hidden md:block">
                {selectedLayer.type === 'text' ? 'Text Style' : 'Element Style'}
             </h2>
             <div className="flex items-center gap-2 ml-auto md:ml-0">
               <button onClick={() => onDuplicateLayer(selectedLayer.id)} className="text-g-blue hover:text-blue-700 dark:text-g-blue-light text-xs font-bold bg-blue-50 dark:bg-g-blue/20 px-3.5 py-2 rounded-xl border border-blue-200 dark:border-g-blue/30 transition-colors flex items-center gap-1.5 shadow-sm">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                 <span>Clone</span>
               </button>
               <button onClick={() => onDeleteLayer(selectedLayer.id)} className="text-g-red hover:text-red-700 dark:text-red-400 text-xs font-bold bg-red-50 dark:bg-red-950/40 px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900/50 transition-colors flex items-center gap-1.5 shadow-sm">
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                 <span>Delete</span>
               </button>
             </div>
          </div>

          {/* Layer Ordering Controls */}
          <div className="bg-gray-50 dark:bg-g-dark-card border border-gray-200 dark:border-g-dark-border p-3.5 rounded-2xl space-y-2.5">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider block">Layer Order</span>
            <div className="grid grid-cols-4 gap-2">
              <button onClick={() => onReorderLayer(selectedLayer.id, 'top')} className="py-2 text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:border-g-blue transition-colors shadow-sm">Front</button>
              <button onClick={() => onReorderLayer(selectedLayer.id, 'up')} className="py-2 text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:border-g-blue transition-colors shadow-sm">Up</button>
              <button onClick={() => onReorderLayer(selectedLayer.id, 'down')} className="py-2 text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:border-g-blue transition-colors shadow-sm">Down</button>
              <button onClick={() => onReorderLayer(selectedLayer.id, 'bottom')} className="py-2 text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:border-g-blue transition-colors shadow-sm">Back</button>
            </div>
          </div>

          {selectedLayer.type === 'text' && (
            <>
                <div className="flex flex-col gap-3">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Font & Size</label>
                    <select 
                    value={(selectedLayer as TextLayer).fontFamily}
                    onChange={(e) => onUpdateLayer(selectedLayer.id, { fontFamily: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-g-dark-card border border-gray-200 dark:border-g-dark-border rounded-xl p-3 text-xs md:text-sm focus:border-g-blue outline-none text-gray-900 dark:text-g-dark-text font-medium"
                    >
                    {FONTS.map(f => (
                        <option key={f.value} value={f.value}>{f.name}</option>
                    ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2.5">
                        <div className="flex flex-col gap-1">
                            <span className="text-[11px] text-gray-400 font-medium">Font Size</span>
                            <input type="number" value={(selectedLayer as TextLayer).fontSize} onChange={(e) => onUpdateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })} className="bg-gray-50 dark:bg-g-dark-card border border-gray-200 dark:border-g-dark-border rounded-xl p-2.5 text-xs md:text-sm text-gray-900 dark:text-g-dark-text outline-none focus:border-g-blue" placeholder="Size" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[11px] text-gray-400 font-medium">Letter Spacing</span>
                            <input type="number" value={(selectedLayer as TextLayer).letterSpacing} onChange={(e) => onUpdateLayer(selectedLayer.id, { letterSpacing: Number(e.target.value) })} className="bg-gray-50 dark:bg-g-dark-card border border-gray-200 dark:border-g-dark-border rounded-xl p-2.5 text-xs md:text-sm text-gray-900 dark:text-g-dark-text outline-none focus:border-g-blue" placeholder="Spacing" />
                        </div>
                    </div>
                </div>
                
                 <div className="flex flex-col gap-4 border-t border-gray-100 dark:border-g-dark-border pt-4">
                    <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Appearance</label>
                    <div className="flex gap-2">
                        <button onClick={() => onUpdateLayer(selectedLayer.id, { gradient: null })} className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all ${!(selectedLayer as TextLayer).gradient ? 'bg-g-blue text-white border-g-blue shadow-sm' : 'bg-gray-50 dark:bg-g-dark-card border-gray-200 dark:border-g-dark-border text-gray-600 dark:text-gray-300'}`}>Solid Color</button>
                        <button onClick={() => onUpdateLayer(selectedLayer.id, { gradient: 'linear-gradient(to right, #1a73e8, #34a853)' })} className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all ${(selectedLayer as TextLayer).gradient ? 'bg-g-blue text-white border-g-blue shadow-sm' : 'bg-gray-50 dark:bg-g-dark-card border-gray-200 dark:border-g-dark-border text-gray-600 dark:text-gray-300'}`}>Gradient</button>
                    </div>

                    {!(selectedLayer as TextLayer).gradient ? (
                         <div className="flex justify-between bg-gray-50 dark:bg-g-dark-card border border-gray-200 dark:border-g-dark-border p-3 rounded-xl items-center">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Text Color</span>
                            <input type="color" value={(selectedLayer as TextLayer).color} onChange={(e) => onUpdateLayer(selectedLayer.id, { color: e.target.value })} className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border-0" />
                         </div>
                    ) : (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {[
                                'linear-gradient(to right, #1a73e8, #ea4335)',
                                'linear-gradient(to right, #34a853, #fbbc04)',
                                'linear-gradient(to right, #ea4335, #fbbc04)',
                                'linear-gradient(45deg, #f8f9fa 0%, #dadce0 100%)',
                                'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)',
                                'linear-gradient(to bottom, #202124, #5f6368)',
                            ].map((grad, i) => (
                                <button key={i} onClick={() => onUpdateLayer(selectedLayer.id, { gradient: grad })} className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 shrink-0 shadow-sm hover:scale-105 transition-transform" style={{ background: grad }} />
                            ))}
                        </div>
                    )}

                    <div className="bg-gray-50 dark:bg-g-dark-card border border-gray-200 dark:border-g-dark-border p-3.5 rounded-2xl space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Text Stroke</span>
                            <input type="color" value={(selectedLayer as TextLayer).strokeColor || '#000000'} onChange={(e) => onUpdateLayer(selectedLayer.id, { strokeColor: e.target.value })} className="w-6 h-6 bg-transparent cursor-pointer border-0" />
                        </div>
                        <input type="range" min="0" max="20" step="0.5" value={(selectedLayer as TextLayer).strokeWidth || 0} onChange={(e) => onUpdateLayer(selectedLayer.id, { strokeWidth: Number(e.target.value) })} className="w-full accent-g-blue h-1 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer" />
                    </div>

                    <div className="bg-gray-50 dark:bg-g-dark-card border border-gray-200 dark:border-g-dark-border p-3.5 rounded-2xl space-y-2">
                         <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Drop Shadow</span>
                            <input type="checkbox" checked={(selectedLayer as TextLayer).shadow} onChange={(e) => onUpdateLayer(selectedLayer.id, { shadow: e.target.checked })} className="accent-g-blue w-4 h-4 rounded cursor-pointer" />
                         </div>
                         {(selectedLayer as TextLayer).shadow && (
                             <>
                                <input type="color" value={(selectedLayer as TextLayer).shadowColor} onChange={(e) => onUpdateLayer(selectedLayer.id, { shadowColor: e.target.value })} className="w-full h-6 bg-transparent cursor-pointer block border-0" />
                                <input type="range" min="0" max="50" value={(selectedLayer as TextLayer).shadowBlur} onChange={(e) => onUpdateLayer(selectedLayer.id, { shadowBlur: Number(e.target.value) })} className="w-full accent-g-blue h-1 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer" />
                             </>
                         )}
                    </div>
                </div>
                
               <div className="mt-2 md:mt-4 pt-4 border-t border-gray-100 dark:border-g-dark-border">
                <label className="text-xs font-bold text-g-blue dark:text-g-blue-light uppercase tracking-wider mb-2 block">✨ AI Text Assistant</label>
                <div className="flex gap-2">
                    <input type="text" placeholder="Topic, e.g., summer sale..." className="flex-1 bg-gray-50 dark:bg-g-dark-card text-xs p-3 rounded-xl border border-gray-200 dark:border-g-dark-border text-gray-900 dark:text-g-dark-text outline-none focus:border-g-blue" value={suggestionTopic} onChange={(e) => setSuggestionTopic(e.target.value)} />
                    <button onClick={handleGenerateText} disabled={loadingSuggestions} className="bg-g-blue text-white text-xs font-bold px-4 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">Go</button>
                </div>
                {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2.5">
                        {suggestions.map((s, i) => (
                            <button key={i} onClick={() => applySuggestion(s)} className="text-[11px] bg-blue-50 dark:bg-g-blue/20 hover:bg-g-blue hover:text-white dark:hover:bg-g-blue px-3 py-1.5 rounded-xl text-g-blue dark:text-g-blue-light font-medium border border-blue-100 dark:border-g-blue/30 transition-colors">{s}</button>
                        ))}
                    </div>
                )}
               </div>
            </>
          )}

          {selectedLayer.type === 'image' && (
             <div className="flex flex-col gap-4">
                 <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Image & Element Controls</label>
                 
                 {/* Flip Controls */}
                 <div className="bg-gray-50 dark:bg-g-dark-card border border-gray-200 dark:border-g-dark-border p-3.5 rounded-2xl space-y-2">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">Flip Element</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => onUpdateLayer(selectedLayer.id, { flipX: !(selectedLayer as ImageLayer).flipX })}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${(selectedLayer as ImageLayer).flipX ? 'bg-g-blue text-white border-g-blue shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}
                      >
                        ↔ Flip Horiz
                      </button>
                      <button 
                        onClick={() => onUpdateLayer(selectedLayer.id, { flipY: !(selectedLayer as ImageLayer).flipY })}
                        className={`py-2 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${(selectedLayer as ImageLayer).flipY ? 'bg-g-blue text-white border-g-blue shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'}`}
                      >
                        ↕ Flip Vert
                      </button>
                    </div>
                 </div>

                 <div className="bg-gray-50 dark:bg-g-dark-card border border-gray-200 dark:border-g-dark-border p-3.5 rounded-2xl space-y-2">
                     <div className="flex justify-between">
                         <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Opacity</span>
                         <span className="text-xs font-mono font-bold text-g-blue dark:text-g-blue-light">{Math.round((selectedLayer.opacity || 1) * 100)}%</span>
                     </div>
                     <input type="range" min="0" max="1" step="0.01" value={selectedLayer.opacity || 1} onChange={(e) => onUpdateLayer(selectedLayer.id, { opacity: Number(e.target.value) })} className="w-full accent-g-blue h-1 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer" />
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 dark:bg-g-dark-card border border-gray-200 dark:border-g-dark-border p-3 rounded-xl"><span className="text-[10px] text-gray-400 font-medium block">Width</span><span className="text-xs font-mono font-bold text-gray-900 dark:text-g-dark-text">{(selectedLayer as ImageLayer).width.toFixed(0)}px</span></div>
                    <div className="bg-gray-50 dark:bg-g-dark-card border border-gray-200 dark:border-g-dark-border p-3 rounded-xl"><span className="text-[10px] text-gray-400 font-medium block">Height</span><span className="text-xs font-mono font-bold text-gray-900 dark:text-g-dark-text">{(selectedLayer as ImageLayer).height.toFixed(0)}px</span></div>
                 </div>
             </div>
          )}
        </div>
    );
  };

  const renderCanvasTab = () => {
    return (
      <div className="flex flex-col gap-5 p-5 md:p-6 h-full overflow-y-auto scrollbar-hide pb-20 md:pb-24">
         <h2 className="text-xl font-extrabold tracking-tight text-g-text dark:text-g-dark-text hidden md:block">Canvas Settings</h2>
         <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aspect Ratio</label>
            <div className="grid grid-cols-3 md:grid-cols-2 gap-2.5">
              {ASPECT_RATIOS.map(ratio => {
                const isSelected = currentAspectRatio === ratio.name;
                return (
                  <button 
                    key={ratio.name} 
                    onClick={() => onAspectRatioChange(ratio.name)} 
                    className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                      isSelected 
                        ? 'bg-g-blue border-g-blue text-white font-bold shadow-md shadow-blue-500/20 scale-[1.02]' 
                        : 'bg-gray-50 dark:bg-g-dark-card border-gray-200 dark:border-g-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60'
                    }`}
                  >
                     <div className={`border rounded-sm mb-0.5 w-4 h-4 ${isSelected ? 'border-white opacity-90' : 'border-current opacity-60'}`}></div>
                     <span className="text-xs font-semibold tracking-tight whitespace-nowrap">{ratio.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
         </div>
         <hr className="border-gray-100 dark:border-g-dark-border" />
         <div className="flex flex-col gap-2.5">
            <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Canvas Filters</label>
            <div className="grid grid-cols-3 gap-2">
                {['none', 'grayscale(100%)', 'sepia(100%)', 'contrast(125%)', 'brightness(110%)', 'saturate(150%)'].map((f) => {
                  const isSelected = currentFilter === f;
                  return (
                    <button 
                      key={f} 
                      onClick={() => onFilterChange(f)} 
                      className={`h-10 rounded-xl border flex items-center justify-center text-[11px] font-bold tracking-wider uppercase transition-all ${
                        isSelected 
                          ? 'bg-g-blue border-g-blue text-white shadow-sm' 
                          : 'bg-gray-50 dark:bg-g-dark-card border-gray-200 dark:border-g-dark-border text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {f === 'none' ? 'Normal' : f.split('(')[0]}
                    </button>
                  );
                })}
            </div>
         </div>
      </div>
    );
  };

  const wrapperClasses = `
    fixed bottom-[64px] left-0 w-full bg-white dark:bg-g-dark-surface border-t border-gray-200 dark:border-g-dark-border rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-all duration-200 z-40
    md:relative md:bottom-auto md:left-auto md:h-full md:bg-white md:dark:bg-g-dark-surface md:border-t-0 md:border-l md:rounded-none md:shadow-none md:transform-none shrink-0
    ${mobileVisible ? 'translate-y-0' : 'translate-y-[110%]'}
  `;
  
  const style = {
      width: window.innerWidth >= 768 ? `${sidebarWidth}px` : undefined,
      maxHeight: window.innerWidth < 768 ? '55vh' : undefined,
  };

  return (
    <div className={wrapperClasses} style={style}>
      {/* Resizer Handle on Left Edge (Desktop) */}
      <div 
        onMouseDown={handleMouseDownResizer}
        className="hidden md:block absolute left-0 top-0 bottom-0 w-3 -ml-1.5 cursor-col-resize z-50 group hover:bg-g-blue/30 active:bg-g-blue transition-colors"
        title="Drag to resize sidebar width"
      >
        <div className="w-1 h-12 bg-gray-300 dark:bg-gray-600 group-hover:bg-g-blue dark:group-hover:bg-g-blue-light rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-colors" />
      </div>

      <div className="md:hidden w-full flex flex-col items-center pt-2 pb-1 border-b border-gray-100 dark:border-g-dark-border" onClick={onCloseMobile}>
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mb-2"></div>
          <div className="w-full flex justify-between px-4 items-center">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">{activeTab === 'design' ? 'Design' : 'Canvas'}</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
      </div>

      <div className="flex border-b border-gray-200 dark:border-g-dark-border bg-gray-50/50 dark:bg-g-dark-surface">
        <button onClick={() => setActiveTab('design')} className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider relative transition-colors ${activeTab === 'design' ? 'text-g-blue dark:text-g-blue-light bg-white dark:bg-g-dark-card' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}>
            Design
            {activeTab === 'design' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-g-blue dark:bg-g-blue-light" />}
        </button>
        <button onClick={() => setActiveTab('canvas')} className={`flex-1 py-3.5 text-xs font-bold uppercase tracking-wider relative transition-colors ${activeTab === 'canvas' ? 'text-g-blue dark:text-g-blue-light bg-white dark:bg-g-dark-card' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'}`}>
            Canvas
            {activeTab === 'canvas' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-g-blue dark:bg-g-blue-light" />}
        </button>
      </div>
      {activeTab === 'design' ? renderDesignTab() : renderCanvasTab()}
    </div>
  );
};

export default PropertyBar;