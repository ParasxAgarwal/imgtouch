export enum ToolType {
  SELECT = 'SELECT',
  TEXT = 'TEXT',
  STICKER = 'STICKER',
  TEMPLATES = 'TEMPLATES',
  AI_GENERATE = 'AI_GENERATE',
  AI_EDIT = 'AI_EDIT',
  FILTERS = 'FILTERS',
  CROP = 'CROP'
}

export interface BaseLayer {
  id: string;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  fontWeight: string;
  letterSpacing: number;
  lineHeight: number;
  
  // Advanced Effects
  gradient?: string | null; // CSS linear-gradient string
  strokeColor?: string | null;
  strokeWidth?: number;
  skewX?: number;
  
  // Shadow/Glow
  shadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string;
  width: number;
  height: number;
  filter?: string; // CSS filter
  flipX?: boolean;
  flipY?: boolean;
}

export type Layer = TextLayer | ImageLayer;
export type TemplateLayer = Omit<TextLayer, 'id'> | Omit<ImageLayer, 'id'>;

export interface AspectRatio {
  name: string;
  width: number;
  height: number;
  label: string;
}

export interface ImageState {
  backgroundUrl: string | null;
  layers: Layer[];
  selectedLayerId: string | null;
  canvasSize: { width: number; height: number };
  originalSize?: { width: number; height: number }; // New field for default ratio
  aspectRatioName?: string;
  filterStr: string; // CSS filter string
}

export interface FontOption {
  name: string;
  value: string;
  category: 'Serif' | 'Sans' | 'Display' | 'Handwriting' | 'Stylized' | 'Novel';
}

export interface TextPreset {
  name: string;
  style: Partial<TextLayer>;
  previewBg: string;
}

export interface StickerPreset {
  url: string;
  label: string;
  category: 'Shape' | 'Badge' | 'Decoration' | 'Effect';
}

export interface TemplatePreset {
  id: string;
  name: string;
  category: 'Quote' | 'Social' | 'Thumbnail' | 'Product' | 'Banner';
  aspectRatioName: string;
  canvasSize: { width: number; height: number };
  backgroundColor?: string;
  backgroundUrl?: string;
  layers: TemplateLayer[];
  previewGradient: string;
}

export interface AIRequestState {
  loading: boolean;
  error: string | null;
}
