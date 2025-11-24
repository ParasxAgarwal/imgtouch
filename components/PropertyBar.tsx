import React, { useState, useEffect } from 'react';
import { ToolType, Layer, TextLayer, ImageLayer } from '../types';
import { FONTS, TEXT_PRESETS, ASPECT_RATIOS, STICKER_PRESETS } from '../constants';
import { generateCreativeText } from '../services/geminiService';

interface PropertyBarProps {
  activeTool: ToolType;
  selectedLayer: Layer | null;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onDeleteLayer: (id: string) => void;
  onAddSticker: (url: string) => void;
  onAddText: (style?: Partial<TextLayer>) => void;
  onFilterChange: (filter: string) => void;
  currentFilter: string;
  onAspectRatioChange: (name: string) => void;
  currentAspectRatio: string;
  mobileVisible: boolean;
  onCloseMobile: () => void;
}

const PropertyBar: React.FC<PropertyBarProps> = ({
  activeTool,
  selectedLayer,
  onUpdateLayer,
  onDeleteLayer,
  onAddSticker,
  onAddText,
  onFilterChange,
  currentFilter,
  onAspectRatioChange,
  currentAspectRatio,
  mobileVisible,
  onCloseMobile
}) => {
  const [suggestionTopic, setSuggestionTopic] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  
  const [activeTab, setActiveTab] = useState<'design' | 'canvas'>('canvas');

  useEffect(() => {
    if (selectedLayer || activeTool === ToolType.TEXT || activeTool === ToolType.STICKER) {
      setActiveTab('design');
    } else {
      setActiveTab('canvas');
    }
  }, [selectedLayer, activeTool]);

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
    // 1. STICKER TOOL (ASSETS)
    if (activeTool === ToolType.STICKER) {
        return (
            <div className="flex flex-col gap-4 md:gap-6 p-3 md:p-6 overflow-y-auto h-full scrollbar-hide pb-20 md:pb-24">
                <h2 className="text-xl font-bold font-bebas tracking-wide text-white hidden md:block">Elements & Stickers</h2>
                <div className="flex flex-col gap-2 md:gap-3">
                    <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Custom Upload</label>
                    <label className="flex items-center justify-center gap-2 w-full border border-dashed border-gray-600 rounded-lg p-3 hover:bg-white/5 hover:border-z-lime cursor-pointer transition-all">
                        <svg className="w-4 h-4 text-z-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        <span className="text-[10px] md:text-xs font-bold">Upload Image</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Paste URL..." className="flex-1 bg-black/50 text-[10px] md:text-xs p-2 rounded border border-gray-700 text-white" value={customUrl} onChange={(e) => setCustomUrl(e.target.value)} />
                        <button onClick={() => { if(customUrl) { onAddSticker(customUrl); setCustomUrl(''); }}} className="bg-z-lime text-black text-[10px] md:text-xs font-bold px-3 rounded">Add</button>
                    </div>
                </div>
                <hr className="border-white/10" />
                <div className="grid grid-cols-5 md:grid-cols-3 gap-2">
                    {STICKER_PRESETS.map((sticker, idx) => (
                        <button key={idx} onClick={() => onAddSticker(sticker.url)} className="aspect-square bg-white/5 border border-white/5 rounded-lg p-1 md:p-2 hover:border-z-lime transition-all group flex items-center justify-center">
                            <img src={sticker.url} alt={sticker.label} className="w-full h-full object-contain opacity-70 group-hover:opacity-100 invert" />
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // 2. TEXT TOOL OR NO SELECTION (SHOW TEXT PRESETS)
    if (!selectedLayer || activeTool === ToolType.TEXT) {
        return (
            <div className="flex flex-col gap-4 md:gap-6 p-3 md:p-6 overflow-y-auto h-full scrollbar-hide pb-20 md:pb-24">
                <h2 className="text-xl font-bold font-bebas tracking-wide text-white hidden md:block">Add Text</h2>
                <div className="bg-gradient-to-r from-z-violet/20 to-z-pink/20 p-3 md:p-4 rounded-xl border border-white/10">
                    <button onClick={() => onAddText()} className="w-full py-2 md:py-3 bg-white text-black font-bold rounded-lg shadow-lg hover:scale-105 transition-transform text-xs md:text-sm">
                        + Add Heading
                    </button>
                </div>
                
                <div className="flex flex-col gap-2 md:gap-3">
                    <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Pro Styles</label>
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                        {TEXT_PRESETS.map(preset => (
                            <button
                                key={preset.name}
                                onClick={() => onAddText(preset.style)}
                                className={`${preset.previewBg} border border-white/10 rounded-lg p-2 md:p-3 hover:border-z-cyan transition-all text-center group relative overflow-hidden h-16 md:h-20 flex items-center justify-center`}
                            >
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                                <span className={`text-xs md:text-sm font-bold ${preset.style.fontFamily} relative z-10 text-shadow`} style={{
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

    // 3. SELECTED LAYER EDITING
    return (
        <div className="flex flex-col gap-4 md:gap-6 p-3 md:p-6 overflow-y-auto h-full scrollbar-hide pb-20 md:pb-24">
          <div className="flex justify-between items-center">
             <h2 className="text-xl font-bold font-bebas tracking-wide text-white hidden md:block">
                {selectedLayer.type === 'text' ? 'Text Style' : 'Element Style'}
             </h2>
             <button onClick={() => onDeleteLayer(selectedLayer.id)} className="text-red-400 hover:text-red-300 text-[10px] md:text-xs uppercase font-bold bg-red-400/10 px-3 md:px-4 py-1 md:py-2 rounded border border-red-400/20 ml-auto md:ml-0">Delete</button>
          </div>

          {selectedLayer.type === 'text' && (
            <>
                {/* Typography */}
                <div className="flex flex-col gap-2 md:gap-3">
                    <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Font & Size</label>
                    <select 
                    value={(selectedLayer as TextLayer).fontFamily}
                    onChange={(e) => onUpdateLayer(selectedLayer.id, { fontFamily: e.target.value })}
                    className="w-full bg-z-dark border border-gray-700 rounded-lg p-2 text-xs md:text-sm focus:border-z-cyan outline-none font-sans"
                    >
                    {FONTS.map(f => (
                        <option key={f.value} value={f.value}>{f.name}</option>
                    ))}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                        <input type="number" value={(selectedLayer as TextLayer).fontSize} onChange={(e) => onUpdateLayer(selectedLayer.id, { fontSize: Number(e.target.value) })} className="bg-z-dark border border-gray-700 rounded p-2 text-xs md:text-sm" placeholder="Size" />
                        <input type="number" value={(selectedLayer as TextLayer).letterSpacing} onChange={(e) => onUpdateLayer(selectedLayer.id, { letterSpacing: Number(e.target.value) })} className="bg-z-dark border border-gray-700 rounded p-2 text-xs md:text-sm" placeholder="Spacing" />
                    </div>
                </div>
                
                {/* Colors & Gradient */}
                 <div className="flex flex-col gap-3 md:gap-4 border-t border-white/10 pt-3 md:pt-4">
                    <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Appearance</label>
                    <div className="flex gap-2">
                        <button onClick={() => onUpdateLayer(selectedLayer.id, { gradient: null })} className={`flex-1 py-1 text-[10px] md:text-xs font-bold rounded ${!(selectedLayer as TextLayer).gradient ? 'bg-white text-black' : 'bg-white/5 text-gray-400'}`}>Solid</button>
                        <button onClick={() => onUpdateLayer(selectedLayer.id, { gradient: 'linear-gradient(to right, #00f7ff, #bd00ff)' })} className={`flex-1 py-1 text-[10px] md:text-xs font-bold rounded ${(selectedLayer as TextLayer).gradient ? 'bg-gradient-to-r from-z-cyan to-z-violet text-white' : 'bg-white/5 text-gray-400'}`}>Gradient</button>
                    </div>

                    {!(selectedLayer as TextLayer).gradient ? (
                         <div className="flex justify-between bg-white/5 p-2 rounded items-center">
                            <span className="text-xs text-gray-400">Color</span>
                            <input type="color" value={(selectedLayer as TextLayer).color} onChange={(e) => onUpdateLayer(selectedLayer.id, { color: e.target.value })} className="w-6 h-6 bg-transparent cursor-pointer" />
                         </div>
                    ) : (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {[
                                'linear-gradient(to right, #00f7ff, #bd00ff)',
                                'linear-gradient(to bottom, #ffd700, #fdb931)',
                                'linear-gradient(to right, #ff00cc, #333399)',
                                'linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)',
                                'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)',
                                'linear-gradient(to bottom, #8a0303, #000)',
                            ].map((grad, i) => (
                                <button key={i} onClick={() => onUpdateLayer(selectedLayer.id, { gradient: grad })} className="w-8 h-8 rounded-full border border-white/20 shrink-0" style={{ background: grad }} />
                            ))}
                        </div>
                    )}

                    {/* Stroke */}
                    <div className="bg-white/5 p-2 md:p-3 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-400">Stroke</span>
                            <input type="color" value={(selectedLayer as TextLayer).strokeColor || '#000000'} onChange={(e) => onUpdateLayer(selectedLayer.id, { strokeColor: e.target.value })} className="w-5 h-5 bg-transparent cursor-pointer" />
                        </div>
                        <input type="range" min="0" max="20" step="0.5" value={(selectedLayer as TextLayer).strokeWidth || 0} onChange={(e) => onUpdateLayer(selectedLayer.id, { strokeWidth: Number(e.target.value) })} className="w-full accent-z-pink h-1 bg-gray-700 rounded" />
                    </div>

                     {/* Shadow */}
                    <div className="bg-white/5 p-2 md:p-3 rounded-lg space-y-2">
                         <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Shadow</span>
                            <input type="checkbox" checked={(selectedLayer as TextLayer).shadow} onChange={(e) => onUpdateLayer(selectedLayer.id, { shadow: e.target.checked })} className="accent-z-lime" />
                         </div>
                         {(selectedLayer as TextLayer).shadow && (
                             <>
                                <input type="color" value={(selectedLayer as TextLayer).shadowColor} onChange={(e) => onUpdateLayer(selectedLayer.id, { shadowColor: e.target.value })} className="w-full h-6 bg-transparent cursor-pointer block" />
                                <input type="range" min="0" max="50" value={(selectedLayer as TextLayer).shadowBlur} onChange={(e) => onUpdateLayer(selectedLayer.id, { shadowBlur: Number(e.target.value) })} className="w-full accent-z-lime h-1 bg-gray-700 rounded" />
                             </>
                         )}
                    </div>
                </div>
                
                {/* AI Writer */}
               <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-white/10">
                <label className="text-[10px] font-bold text-z-cyan uppercase mb-2 block">✨ AI Writer</label>
                <div className="flex gap-1">
                    <input type="text" placeholder="Topic..." className="flex-1 bg-black/50 text-[10px] md:text-xs p-2 rounded border border-gray-700 text-white" value={suggestionTopic} onChange={(e) => setSuggestionTopic(e.target.value)} />
                    <button onClick={handleGenerateText} disabled={loadingSuggestions} className="bg-z-cyan text-black text-[10px] md:text-xs font-bold px-3 rounded">Go</button>
                </div>
                {suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {suggestions.map((s, i) => (
                            <button key={i} onClick={() => applySuggestion(s)} className="text-[10px] bg-white/10 hover:bg-z-pink px-2 py-1 rounded text-white border border-white/5">{s}</button>
                        ))}
                    </div>
                )}
               </div>
            </>
          )}

          {selectedLayer.type === 'image' && (
             <div className="flex flex-col gap-3 md:gap-4">
                 <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Image Settings</label>
                 <div className="bg-white/5 p-2 md:p-3 rounded-lg">
                     <div className="flex justify-between mb-2">
                         <span className="text-xs text-gray-400">Opacity</span>
                         <span className="text-xs text-gray-500">{Math.round((selectedLayer.opacity || 1) * 100)}%</span>
                     </div>
                     <input type="range" min="0" max="1" step="0.01" value={selectedLayer.opacity || 1} onChange={(e) => onUpdateLayer(selectedLayer.id, { opacity: Number(e.target.value) })} className="w-full accent-z-lime h-1 bg-gray-700 rounded" />
                 </div>
                 <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/5 p-2 rounded"><span className="text-[9px] text-gray-500 block">Width</span><span className="text-xs font-mono">{(selectedLayer as ImageLayer).width.toFixed(0)}px</span></div>
                    <div className="bg-white/5 p-2 rounded"><span className="text-[9px] text-gray-500 block">Height</span><span className="text-xs font-mono">{(selectedLayer as ImageLayer).height.toFixed(0)}px</span></div>
                 </div>
             </div>
          )}
        </div>
    );
  };

  const renderCanvasTab = () => {
    return (
      <div className="flex flex-col gap-4 md:gap-6 p-3 md:p-6 h-full overflow-y-auto scrollbar-hide pb-20 md:pb-24">
         <h2 className="text-xl font-bold font-bebas tracking-wide text-white hidden md:block">Canvas Settings</h2>
         <div className="flex flex-col gap-2 md:gap-3">
            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Size & Ratio</label>
            <div className="grid grid-cols-3 md:grid-cols-2 gap-2">
              {ASPECT_RATIOS.map(ratio => (
                <button key={ratio.name} onClick={() => onAspectRatioChange(ratio.name)} className={`p-2 md:p-3 rounded-lg border flex flex-col items-center gap-1 transition-all ${currentAspectRatio === ratio.name ? 'bg-z-cyan/10 border-z-cyan text-z-cyan' : 'border-gray-700 text-gray-400 hover:bg-white/5'}`}>
                   <div className="border border-current rounded-sm opacity-50 mb-1 w-3 h-3 md:w-4 md:h-4"></div>
                   <span className="text-[9px] font-bold whitespace-nowrap">{ratio.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
         </div>
         <hr className="border-white/10" />
         <div className="flex flex-col gap-2 md:gap-3">
            <label className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Filters</label>
            <div className="grid grid-cols-3 gap-2">
                {['none', 'grayscale(100%)', 'sepia(100%)', 'contrast(125%)', 'brightness(110%)', 'saturate(150%)'].map((f) => (
                    <button key={f} onClick={() => onFilterChange(f)} className={`h-8 md:h-10 rounded border flex items-center justify-center text-[9px] font-bold uppercase ${currentFilter === f ? 'border-z-pink text-z-pink bg-z-pink/10' : 'border-gray-800 text-gray-500 bg-black/40'}`}>{f === 'none' ? 'Normal' : f.split('(')[0]}</button>
                ))}
            </div>
         </div>
      </div>
    );
  };

  // Conditional class logic for Mobile Drawer vs Desktop Sidebar
  const wrapperClasses = `
    fixed bottom-[64px] left-0 w-full bg-z-panel/95 backdrop-blur-xl border-t border-white/10 rounded-t-2xl shadow-2xl transition-transform duration-300 z-40
    md:relative md:bottom-auto md:left-auto md:w-80 md:h-full md:bg-z-black/95 md:border-t-0 md:border-l md:rounded-none md:shadow-none md:transform-none
    ${mobileVisible ? 'translate-y-0' : 'translate-y-[110%]'}
  `;
  
  // Max height for mobile drawer
  const style = {
      maxHeight: '55vh', // Reduced max height slightly for better view
  };

  return (
    <div className={wrapperClasses} style={window.innerWidth < 768 ? style : undefined}>
      {/* Mobile Drag Handle / Header */}
      <div className="md:hidden w-full flex flex-col items-center pt-2 pb-1 border-b border-white/5" onClick={onCloseMobile}>
          <div className="w-10 h-1 bg-gray-600 rounded-full mb-2"></div>
          <div className="w-full flex justify-between px-4 items-center">
            <span className="text-xs font-bold text-white uppercase">{activeTab === 'design' ? 'Design' : 'Canvas'}</span>
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
      </div>

      <div className="flex border-b border-white/10">
        <button onClick={() => setActiveTab('design')} className={`flex-1 py-2 md:py-3 text-[10px] md:text-xs font-bold uppercase tracking-wider relative ${activeTab === 'design' ? 'text-white' : 'text-gray-500'}`}>
            Design
            {activeTab === 'design' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-z-pink" />}
        </button>
        <button onClick={() => setActiveTab('canvas')} className={`flex-1 py-2 md:py-3 text-[10px] md:text-xs font-bold uppercase tracking-wider relative ${activeTab === 'canvas' ? 'text-white' : 'text-gray-500'}`}>
            Canvas
            {activeTab === 'canvas' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-z-cyan" />}
        </button>
      </div>
      {activeTab === 'design' ? renderDesignTab() : renderCanvasTab()}
    </div>
  );
};

export default PropertyBar;