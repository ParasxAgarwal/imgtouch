import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ImageState, Layer, ToolType, TextLayer, ImageLayer } from '../types';

interface CanvasBoardProps {
  imageState: ImageState;
  onLayerSelect: (id: string | null) => void;
  onLayerUpdate: (id: string, updates: Partial<Layer>) => void;
  activeTool: ToolType;
  onCanvasClick: (e: React.MouseEvent) => void;
  setCanvasRef: (ref: HTMLDivElement | null) => void;
  zoomScale: number;
  onZoomChange: (scale: number) => void;
}

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
    const imgLayer = layer as ImageLayer;
    const flipXStr = imgLayer.flipX ? 'scaleX(-1)' : '';
    const flipYStr = imgLayer.flipY ? 'scaleY(-1)' : '';
    return {
        ...baseStyles,
        width: `${layer.width}px`,
        height: `${layer.height}px`,
        transform: `translate(0, 0) rotate(${layer.rotation}deg) ${flipXStr} ${flipYStr}`.trim(),
        pointerEvents: 'auto'
    };
  }

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

  if (textLayer.gradient) {
    textStyles.backgroundImage = textLayer.gradient;
    textStyles.WebkitBackgroundClip = 'text';
    textStyles.WebkitTextFillColor = 'transparent';
    textStyles.color = textLayer.color; 
  } else {
    textStyles.color = textLayer.color;
  }

  if (textLayer.strokeWidth && textLayer.strokeWidth > 0 && textLayer.strokeColor) {
    textStyles.WebkitTextStroke = `${textLayer.strokeWidth}px ${textLayer.strokeColor}`;
  }

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
  setCanvasRef,
  zoomScale,
  onZoomChange
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
    
    if (activeTool === ToolType.SELECT || activeTool === ToolType.TEXT || activeTool === ToolType.STICKER || activeTool === ToolType.TEMPLATES) {
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
      const dx = (e.clientX - startPos.x) / zoomScale;
      const dy = (e.clientY - startPos.y) / zoomScale;
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
      const dx = (e.clientX - startPos.x) / zoomScale;
      const newRotation = (initialLayerProps.rotation || 0) + dx * 0.5;
      onLayerUpdate(draggingId, { rotation: newRotation });

    } else {
      const dx = (e.clientX - startPos.x) / zoomScale;
      const dy = (e.clientY - startPos.y) / zoomScale;
      onLayerUpdate(draggingId, {
        x: (initialLayerProps.x || 0) + dx,
        y: (initialLayerProps.y || 0) + dy
      });
    }
  }, [draggingId, resizing, rotating, startPos, initialLayerProps, imageState.layers, onLayerUpdate, zoomScale]);

  const handleMouseUp = useCallback(() => {
    setDraggingId(null);
    setResizing(false);
    setRotating(false);
  }, []);

  useEffect(() => {
    if (draggingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
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
    filter: imageState.filterStr,
    transform: `scale(${zoomScale})`,
    transition: draggingId ? 'none' : 'transform 0.2s ease, width 0.3s ease, height 0.3s ease, filter 0.3s ease',
    transformOrigin: 'center center',
  };

  return (
    <div 
      className="flex-1 h-full relative flex items-center justify-center p-6 md:p-14 overflow-auto canvas-pattern cursor-default touch-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
            onLayerSelect(null);
            setEditingId(null);
        }
      }}
    >
      {/* Floating Canvas Zoom Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white/90 dark:bg-g-dark-surface/90 backdrop-blur-md border border-gray-200 dark:border-g-dark-border shadow-lg rounded-2xl px-3 py-1.5 flex items-center gap-2">
        <button 
          onClick={() => onZoomChange(Math.max(0.3, zoomScale - 0.1))}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          title="Zoom Out (-10%)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
        </button>
        <button 
          onClick={() => onZoomChange(1.0)}
          className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300 hover:text-g-blue dark:hover:text-g-blue-light px-2 py-0.5 rounded transition-colors"
          title="Reset Zoom to 100%"
        >
          {Math.round(zoomScale * 100)}%
        </button>
        <button 
          onClick={() => onZoomChange(Math.min(2.5, zoomScale + 0.1))}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          title="Zoom In (+10%)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>

      <div 
        ref={containerRef}
        style={containerStyle}
        onClick={(e) => {
             if(!editingId) onCanvasClick(e);
        }}
        className="relative shadow-2xl rounded-sm select-none bg-white dark:bg-g-dark-surface border border-gray-300 dark:border-g-dark-border transition-colors duration-200 shrink-0"
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
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-g-dark-bg/50">
            <div className="border-2 border-dashed border-gray-300 dark:border-g-dark-border rounded-2xl p-8 md:p-12 flex flex-col items-center scale-75 md:scale-100 shadow-inner">
                <div className="bg-white dark:bg-g-dark-card shadow-sm p-6 rounded-2xl mb-4 border border-gray-100 dark:border-g-dark-border">
                    <svg className="w-12 h-12 text-g-blue dark:text-g-blue-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="font-sans font-bold text-2xl text-gray-600 dark:text-gray-300 tracking-tight">Blank Canvas</p>
                <p className="text-xs font-mono font-semibold mt-2 text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                {imageState.canvasSize.width} × {imageState.canvasSize.height} px
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
                            outline: '2px dashed #1a73e8',
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
                            <div className="absolute -inset-2 border-2 border-dashed pointer-events-none border-g-blue dark:border-g-blue-light">
                                <div 
                                    className="absolute -right-3 -bottom-3 w-5 h-5 bg-white dark:bg-g-dark-card border-2 border-g-blue dark:border-g-blue-light rounded-full pointer-events-auto cursor-se-resize shadow-md"
                                    onMouseDown={(e) => handleResizeStart(e, layer.id)}
                                />
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-0.5 h-6 pointer-events-none bg-g-blue dark:bg-g-blue-light"></div>
                                <div 
                                    className="absolute -top-10 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full pointer-events-auto cursor-ew-resize shadow-md flex items-center justify-center hover:scale-110 transition-transform bg-g-blue dark:bg-g-blue-light"
                                    onMouseDown={(e) => handleRotateStart(e, layer.id)}
                                >
                                    <svg className="w-3 h-3 text-white dark:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
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