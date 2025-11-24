import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ImageState, Layer, ToolType, TextLayer, ImageLayer } from '../types';

interface CanvasBoardProps {
  imageState: ImageState;
  onLayerSelect: (id: string | null) => void;
  onLayerUpdate: (id: string, updates: Partial<Layer>) => void;
  activeTool: ToolType;
  onCanvasClick: (e: React.MouseEvent) => void;
  setCanvasRef: (ref: HTMLDivElement | null) => void;
}

// Utility to generate CSS styles for advanced text
const getLayerStyles = (layer: Layer): React.CSSProperties => {
  const baseStyles: React.CSSProperties = {
    position: 'absolute',
    left: `${layer.x}px`,
    top: `${layer.y}px`,
    transform: `translate(0, 0) rotate(${layer.rotation}deg)`,
    cursor: 'move',
    userSelect: 'none',
    zIndex: 10,
    opacity: layer.opacity !== undefined ? layer.opacity : 1,
  };

  if (layer.type === 'image') {
      return {
          ...baseStyles,
          width: `${layer.width}px`,
          height: `${layer.height}px`,
          pointerEvents: 'auto'
      };
  }

  // Text Specific
  const textLayer = layer as TextLayer;
  const textStyles: React.CSSProperties = {
    ...baseStyles,
    fontFamily: textLayer.fontFamily.includes('font-') ? undefined : textLayer.fontFamily,
    fontSize: `${textLayer.fontSize}px`,
    fontWeight: textLayer.fontWeight,
    letterSpacing: `${textLayer.letterSpacing}px`,
    lineHeight: textLayer.lineHeight,
    transform: `translate(0, 0) rotate(${textLayer.rotation}deg) skewX(${textLayer.skewX || 0}deg)`,
    whiteSpace: 'pre',
    paintOrder: 'stroke fill', 
    WebkitFontSmoothing: 'antialiased',
  };

  // Handle Gradients vs Color
  if (textLayer.gradient) {
    textStyles.backgroundImage = textLayer.gradient;
    textStyles.WebkitBackgroundClip = 'text';
    textStyles.WebkitTextFillColor = 'transparent';
    textStyles.color = textLayer.color; 
  } else {
    textStyles.color = textLayer.color;
  }

  // Handle Stroke
  if (textLayer.strokeWidth && textLayer.strokeWidth > 0 && textLayer.strokeColor) {
    textStyles.WebkitTextStroke = `${textLayer.strokeWidth}px ${textLayer.strokeColor}`;
  }

  // Handle Shadow
  if (textLayer.shadow) {
    const shadowStr = `${textLayer.shadowOffsetX}px ${textLayer.shadowOffsetY}px ${textLayer.shadowBlur}px ${textLayer.shadowColor}`;
    if (textLayer.gradient) {
      textStyles.filter = `drop-shadow(${shadowStr})`;
    } else {
      textStyles.textShadow = shadowStr;
    }
  }

  return textStyles;
};

const CanvasBoard: React.FC<CanvasBoardProps> = ({
  imageState,
  onLayerSelect,
  onLayerUpdate,
  activeTool,
  onCanvasClick,
  setCanvasRef
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [resizing, setResizing] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [initialLayerProps, setInitialLayerProps] = useState<Partial<Layer>>({});

  useEffect(() => {
    if (containerRef.current) {
      setCanvasRef(containerRef.current);
    }
  }, [setCanvasRef]);

  const handleLayerMouseDown = (e: React.MouseEvent, layerId: string) => {
    if (editingId) return;
    e.stopPropagation();
    
    onLayerSelect(layerId);
    
    if (activeTool === ToolType.SELECT || activeTool === ToolType.TEXT || activeTool === ToolType.STICKER) {
        setDraggingId(layerId);
        const layer = imageState.layers.find(l => l.id === layerId);
        if (layer) {
            setStartPos({ x: e.clientX, y: e.clientY });
            setInitialLayerProps({ x: layer.x, y: layer.y });
        }
    }
  };

  const handleResizeStart = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    setResizing(true);
    setDraggingId(layerId);
    const layer = imageState.layers.find(l => l.id === layerId);
    if (layer) {
        setStartPos({ x: e.clientX, y: e.clientY });
        if (layer.type === 'text') {
            setInitialLayerProps({ fontSize: (layer as TextLayer).fontSize });
        } else {
            setInitialLayerProps({ width: (layer as ImageLayer).width, height: (layer as ImageLayer).height });
        }
    }
  };

  const handleRotateStart = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    setRotating(true);
    setDraggingId(layerId);
    setStartPos({ x: e.clientX, y: e.clientY });
    const layer = imageState.layers.find(l => l.id === layerId);
    setInitialLayerProps({ rotation: layer?.rotation || 0 });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggingId) return;
    
    const layer = imageState.layers.find(l => l.id === draggingId);
    if (!layer) return;

    if (resizing) {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      const delta = (dx + dy) / 2; 
      
      if (layer.type === 'text') {
         const newSize = Math.max(12, ((initialLayerProps as TextLayer).fontSize || 64) + delta);
         onLayerUpdate(draggingId, { fontSize: newSize });
      } else {
         const baseW = (initialLayerProps as ImageLayer).width || 100;
         const baseH = (initialLayerProps as ImageLayer).height || 100;
         const scale = Math.max(0.1, 1 + (delta / 200));
         onLayerUpdate(draggingId, { width: baseW * scale, height: baseH * scale });
      }

    } else if (rotating) {
      const dx = e.clientX - startPos.x;
      const newRotation = (initialLayerProps.rotation || 0) + dx * 0.5;
      onLayerUpdate(draggingId, { rotation: newRotation });

    } else {
      const dx = e.clientX - startPos.x;
      const dy = e.clientY - startPos.y;
      onLayerUpdate(draggingId, {
        x: (initialLayerProps.x || 0) + dx,
        y: (initialLayerProps.y || 0) + dy
      });
    }
  }, [draggingId, resizing, rotating, startPos, initialLayerProps, imageState.layers, onLayerUpdate]);

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
    setResizing(false);
    setRotating(false);
  }, []);

  useEffect(() => {
    if (draggingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      // Touch events could be added here for better mobile dragging support in future
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, handleMouseMove, handleMouseUp]);

  const handleDoubleClick = (e: React.MouseEvent, layerId: string) => {
    const layer = imageState.layers.find(l => l.id === layerId);
    if (layer && layer.type === 'text') {
        e.stopPropagation();
        setEditingId(layerId);
        onLayerSelect(layerId);
    }
  };

  const containerStyle: React.CSSProperties = {
    width: `${imageState.canvasSize.width}px`,
    height: `${imageState.canvasSize.height}px`,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0a0a0a',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    filter: imageState.filterStr,
    transition: 'width 0.3s ease, height 0.3s ease, filter 0.3s ease',
    transformOrigin: 'center center',
    maxWidth: '100%', // Ensure it doesn't overflow on mobile
    maxHeight: '100%', // Ensure it doesn't overflow height
  };

  return (
    <div 
      className="flex-1 h-full relative flex items-center justify-center p-4 md:p-12 overflow-auto canvas-pattern cursor-default touch-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
            onLayerSelect(null);
            setEditingId(null);
        }
      }}
    >
      <div 
        ref={containerRef}
        style={containerStyle}
        onClick={(e) => {
             if(!editingId) onCanvasClick(e);
        }}
        className="relative shadow-2xl select-none border border-white/5"
      >
        {imageState.backgroundUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
                <img 
                    src={imageState.backgroundUrl} 
                    alt="Canvas Background" 
                    className="w-full h-full object-contain pointer-events-none"
                />
            </div>
        )}
        
        {!imageState.backgroundUrl && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600 bg-z-panel/20">
            <div className="border-2 border-dashed border-gray-700/50 rounded-lg p-8 md:p-12 flex flex-col items-center scale-75 md:scale-100">
                <div className="bg-z-panel/50 p-6 rounded-full mb-4">
                    <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="font-bebas text-2xl opacity-50">Blank Canvas</p>
                <p className="text-xs font-mono mt-2 opacity-40">
                {imageState.canvasSize.width} x {imageState.canvasSize.height}
                </p>
            </div>
          </div>
        )}

        {/* Layers */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
           {imageState.layers.map(layer => {
             const isSelected = imageState.selectedLayerId === layer.id;
             const isEditing = editingId === layer.id;
             const styles = getLayerStyles(layer);
             
             if (layer.type === 'text' && isEditing) {
                return (
                    <textarea
                        key={layer.id}
                        autoFocus
                        value={(layer as TextLayer).text}
                        onChange={(e) => onLayerUpdate(layer.id, { text: e.target.value })}
                        onBlur={() => setEditingId(null)}
                        style={{
                            ...styles,
                            pointerEvents: 'auto',
                            background: 'transparent',
                            border: 'none',
                            outline: '2px dashed #ccff00',
                            resize: 'none',
                            overflow: 'hidden',
                            minWidth: '100px',
                            height: 'auto',
                            zIndex: 100
                        }}
                        className={`${(layer as TextLayer).fontFamily.startsWith('font-') ? (layer as TextLayer).fontFamily : ''}`}
                    />
                );
             }

             return (
                <div
                    key={layer.id}
                    style={styles}
                    className={`${layer.type === 'text' && (layer as TextLayer).fontFamily.startsWith('font-') ? (layer as TextLayer).fontFamily : ''} group pointer-events-auto select-none hover:opacity-90`}
                    onMouseDown={(e) => handleLayerMouseDown(e, layer.id)}
                    onDoubleClick={(e) => handleDoubleClick(e, layer.id)}
                >
                    <div className="relative w-full h-full">
                        {layer.type === 'text' ? (layer as TextLayer).text : (
                            <img src={(layer as ImageLayer).src} alt="sticker" className="w-full h-full object-contain pointer-events-none" />
                        )}
                        
                        {isSelected && (
                            <div className={`absolute -inset-2 border-2 border-dashed pointer-events-none ${layer.type === 'image' ? 'border-z-lime' : 'border-z-cyan'}`}>
                                <div 
                                    className={`absolute -right-3 -bottom-3 w-5 h-5 bg-white border-2 rounded-full pointer-events-auto cursor-se-resize shadow-lg ${layer.type === 'image' ? 'border-z-lime' : 'border-z-cyan'}`}
                                    onMouseDown={(e) => handleResizeStart(e, layer.id)}
                                />
                                <div className={`absolute -top-8 left-1/2 -translate-x-1/2 w-1 h-6 pointer-events-none ${layer.type === 'image' ? 'bg-z-lime' : 'bg-z-cyan'}`}></div>
                                <div 
                                    className={`absolute -top-10 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full pointer-events-auto cursor-ew-resize shadow-lg flex items-center justify-center hover:scale-110 transition-transform ${layer.type === 'image' ? 'bg-z-lime' : 'bg-z-cyan'}`}
                                    onMouseDown={(e) => handleRotateStart(e, layer.id)}
                                >
                                    <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
             );
           })}
        </div>
      </div>
    </div>
  );
};

export default CanvasBoard;