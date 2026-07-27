import { FontOption, TextPreset, TextLayer, AspectRatio, StickerPreset, TemplatePreset } from './types';

export const FONTS: FontOption[] = [
  { name: 'Inter', value: 'font-sans', category: 'Sans' },
  { name: 'Bebas Neue', value: 'font-bebas', category: 'Display' },
  { name: 'Abril Fatface', value: 'font-abril', category: 'Display' },
  { name: 'Cinzel', value: 'font-cinzel', category: 'Novel' },
  { name: 'Cinzel Decorative', value: 'font-cinzel-dec', category: 'Novel' },
  { name: 'Unifraktur Maguntia', value: 'font-gothic', category: 'Novel' },
  { name: 'Metal Mania', value: 'font-metal', category: 'Novel' },
  { name: 'Creepster', value: 'font-creepster', category: 'Novel' },
  { name: 'Orbitron', value: 'font-orbitron', category: 'Stylized' },
  { name: 'Ruslan Display', value: 'font-ruslan', category: 'Stylized' },
  { name: 'Rye', value: 'font-rye', category: 'Stylized' },
  { name: 'Dancing Script', value: 'font-dancing', category: 'Handwriting' },
  { name: 'Great Vibes', value: 'font-great-vibes', category: 'Handwriting' },
  { name: 'Monsieur La Doulaise', value: 'font-monsieur', category: 'Novel' },
  { name: 'Pacifico', value: 'font-pacifico', category: 'Handwriting' },
  { name: 'Satisfy', value: 'font-satisfy', category: 'Handwriting' },
  { name: 'Sacramento', value: 'font-sacramento', category: 'Handwriting' },
  { name: 'Parisienne', value: 'font-parisienne', category: 'Handwriting' },
  { name: 'Allura', value: 'font-allura', category: 'Handwriting' },
  { name: 'Pinyon Script', value: 'font-pinyon', category: 'Handwriting' },
  { name: 'Playball', value: 'font-playball', category: 'Handwriting' },
];

export const ASPECT_RATIOS: AspectRatio[] = [
  { name: 'default', width: 0, height: 0, label: 'Original / Default' },
  { name: 'custom', width: 800, height: 600, label: 'Custom' },
  { name: 'novel', width: 600, height: 900, label: '2:3 Novel' },
  { name: 'square', width: 800, height: 800, label: '1:1 Square' },
  { name: 'portrait', width: 750, height: 1000, label: '3:4 Portrait' },
  { name: 'landscape', width: 1000, height: 563, label: '16:9 Banner' },
  { name: 'story', width: 563, height: 1000, label: '9:16 Story' },
];

export const DEFAULT_TEXT_LAYER: Omit<TextLayer, 'id' | 'x' | 'y'> = {
  type: 'text',
  text: 'Enter Title',
  fontSize: 80,
  fontFamily: 'font-cinzel',
  color: '#ffffff',
  rotation: 0,
  opacity: 1,
  fontWeight: 'normal',
  letterSpacing: 0,
  lineHeight: 1.1,
  shadow: true,
  shadowColor: 'rgba(0,0,0,0.8)',
  shadowBlur: 15,
  shadowOffsetX: 0,
  shadowOffsetY: 5,
  strokeWidth: 0,
  strokeColor: '#000000',
  skewX: 0,
  gradient: null,
};

// SVG shapes encoded as Data URIs
const SVG_STAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
const SVG_SHIELD = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>`;
const SVG_CIRCLE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><circle cx="12" cy="12" r="10"/></svg>`;
const SVG_RIBBON = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M4 4h16v12l-8 4-8-4V4z"/></svg>`;

export const STICKER_PRESETS: StickerPreset[] = [
  { label: 'Star Badge', url: SVG_STAR, category: 'Badge' },
  { label: 'Shield', url: SVG_SHIELD, category: 'Badge' },
  { label: 'Circle', url: SVG_CIRCLE, category: 'Shape' },
  { label: 'Banner', url: SVG_RIBBON, category: 'Decoration' },
  { label: 'Magic Circle', url: 'https://cdn-icons-png.flaticon.com/512/7902/7902332.png', category: 'Decoration' },
  { label: 'Grunge Splat', url: 'https://cdn-icons-png.flaticon.com/512/2590/2590194.png', category: 'Effect' },
  { label: 'Smoke', url: 'https://cdn-icons-png.flaticon.com/512/6116/6116282.png', category: 'Effect' },
  { label: 'Blood Stain', url: 'https://cdn-icons-png.flaticon.com/512/927/927898.png', category: 'Effect' },
  { label: 'Sword', url: 'https://cdn-icons-png.flaticon.com/512/2402/2402621.png', category: 'Shape' },
  { label: 'Dragon', url: 'https://cdn-icons-png.flaticon.com/512/3673/3673546.png', category: 'Decoration' }
];

export const TEXT_PRESETS: TextPreset[] = [
  {
    name: 'Xianxia',
    previewBg: 'bg-z-dark',
    style: {
      fontFamily: 'font-cinzel-dec',
      color: '#FFD700',
      gradient: 'linear-gradient(180deg, #FFD700 20%, #FDB931 50%, #9f7928 100%)',
      shadow: true,
      shadowColor: '#000000',
      shadowBlur: 2,
      shadowOffsetX: 3,
      shadowOffsetY: 3,
      strokeColor: '#3e2723',
      strokeWidth: 2,
      letterSpacing: 2,
      skewX: 0,
      text: "IMMORTAL"
    }
  },
  {
    name: 'System',
    previewBg: 'bg-black',
    style: {
      fontFamily: 'font-orbitron',
      color: '#00f7ff',
      gradient: 'linear-gradient(to bottom, #ffffff 0%, #00f7ff 100%)',
      shadow: true,
      shadowColor: '#00f7ff',
      shadowBlur: 25,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      strokeWidth: 2,
      strokeColor: '#003333',
      letterSpacing: 4,
      skewX: -5,
      text: "SYSTEM"
    }
  },
  {
    name: 'Blood',
    previewBg: 'bg-red-950',
    style: {
      fontFamily: 'font-ruslan',
      color: '#8a0303',
      gradient: 'linear-gradient(to bottom, #ff0000, #500000)',
      shadow: true,
      shadowColor: '#000000',
      shadowBlur: 10,
      shadowOffsetX: 0,
      shadowOffsetY: 4,
      strokeColor: '#ffffff',
      strokeWidth: 1,
      letterSpacing: 2,
      text: "BLOOD"
    }
  },
  {
    name: 'Gothic',
    previewBg: 'bg-gray-800',
    style: {
      fontFamily: 'font-gothic',
      color: '#e0e0e0',
      gradient: null,
      shadow: true,
      shadowColor: '#000000',
      shadowBlur: 5,
      shadowOffsetX: 2,
      shadowOffsetY: 2,
      strokeColor: '#000000',
      strokeWidth: 1.5,
      letterSpacing: 1,
      text: "Vampire"
    }
  },
  {
    name: 'Romance',
    previewBg: 'bg-pink-900',
    style: {
      fontFamily: 'font-monsieur',
      color: '#ffcff1',
      gradient: 'linear-gradient(to bottom, #fff 30%, #ffcff1 100%)',
      shadow: true,
      shadowColor: '#ff00cc',
      shadowBlur: 20,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      strokeWidth: 0.5,
      strokeColor: '#ffffff',
      letterSpacing: 0,
      text: "Love"
    }
  },
  {
    name: 'Horror',
    previewBg: 'bg-black',
    style: {
      fontFamily: 'font-creepster',
      color: '#ccff00',
      gradient: 'linear-gradient(to bottom, #ccff00, #005500)',
      shadow: true,
      shadowColor: '#00ff00',
      shadowBlur: 15,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      strokeWidth: 1,
      strokeColor: '#000000',
      letterSpacing: 3,
      text: "FEAR"
    }
  },
  {
    name: 'Western',
    previewBg: 'bg-orange-900',
    style: {
      fontFamily: 'font-rye',
      color: '#f5deb3',
      shadow: true,
      shadowColor: '#3e2723',
      shadowBlur: 0,
      shadowOffsetX: 4,
      shadowOffsetY: 4,
      strokeColor: '#3e2723',
      strokeWidth: 2,
      gradient: null,
      text: "WILD"
    }
  },
  {
    name: 'Cyber',
    previewBg: 'bg-z-dark',
    style: {
      fontFamily: 'font-orbitron',
      color: '#00f7ff',
      gradient: 'linear-gradient(to bottom, #00f7ff, #bd00ff)',
      shadow: true,
      shadowColor: '#bd00ff',
      shadowBlur: 20,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      strokeWidth: 0,
      letterSpacing: 2,
      skewX: -10,
      text: "NEON"
    }
  },
];

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'minimal-quote',
    name: 'Minimalist Quote Card',
    category: 'Quote',
    aspectRatioName: 'square',
    canvasSize: { width: 800, height: 800 },
    previewGradient: 'linear-gradient(135deg, #1a73e8 0%, #34a853 100%)',
    layers: [
      {
        type: 'text',
        text: '“Simplicity is the ultimate sophistication.”',
        fontFamily: 'font-cinzel',
        fontSize: 48,
        color: '#ffffff',
        rotation: 0,
        opacity: 1,
        fontWeight: 'bold',
        letterSpacing: 1,
        lineHeight: 1.2,
        shadow: true,
        shadowColor: 'rgba(0,0,0,0.4)',
        shadowBlur: 10,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        x: 100,
        y: 320
      },
      {
        type: 'text',
        text: '— LEONARDO DA VINCI',
        fontFamily: 'font-sans',
        fontSize: 20,
        color: '#f1f3f4',
        rotation: 0,
        opacity: 0.9,
        fontWeight: 'bold',
        letterSpacing: 4,
        lineHeight: 1,
        shadow: false,
        shadowColor: '#000000',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        x: 260,
        y: 480
      }
    ]
  },
  {
    id: 'youtube-thumb',
    name: 'YouTube Action Thumbnail',
    category: 'Thumbnail',
    aspectRatioName: 'landscape',
    canvasSize: { width: 1000, height: 563 },
    previewGradient: 'linear-gradient(135deg, #ea4335 0%, #fbbc04 100%)',
    layers: [
      {
        type: 'text',
        text: 'HOW I BUILT THIS!',
        fontFamily: 'font-bebas',
        fontSize: 90,
        color: '#ffffff',
        rotation: -3,
        opacity: 1,
        fontWeight: 'bold',
        letterSpacing: 2,
        lineHeight: 1,
        gradient: 'linear-gradient(180deg, #ffffff 0%, #fbbc04 100%)',
        strokeColor: '#000000',
        strokeWidth: 3,
        shadow: true,
        shadowColor: 'rgba(0,0,0,0.8)',
        shadowBlur: 20,
        shadowOffsetX: 4,
        shadowOffsetY: 6,
        x: 80,
        y: 200
      },
      {
        type: 'image',
        src: SVG_STAR,
        width: 140,
        height: 140,
        rotation: 12,
        opacity: 1,
        x: 800,
        y: 60
      }
    ]
  },
  {
    id: 'social-story',
    name: 'Vibrant Story Cover',
    category: 'Social',
    aspectRatioName: 'story',
    canvasSize: { width: 563, height: 1000 },
    previewGradient: 'linear-gradient(180deg, #8ab4f8 0%, #1a73e8 100%)',
    layers: [
      {
        type: 'text',
        text: 'SUMMER VIBES',
        fontFamily: 'font-dancing',
        fontSize: 72,
        color: '#ffffff',
        rotation: -5,
        opacity: 1,
        fontWeight: 'bold',
        letterSpacing: 1,
        lineHeight: 1.1,
        shadow: true,
        shadowColor: 'rgba(0,0,0,0.3)',
        shadowBlur: 12,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
        x: 80,
        y: 420
      }
    ]
  },
  {
    id: 'tech-banner',
    name: 'Cyberpunk Tech Header',
    category: 'Banner',
    aspectRatioName: 'landscape',
    canvasSize: { width: 1000, height: 563 },
    previewGradient: 'linear-gradient(135deg, #111827 0%, #1f2937 100%)',
    layers: [
      {
        type: 'text',
        text: 'FUTURE AI STUDIO',
        fontFamily: 'font-orbitron',
        fontSize: 64,
        color: '#8ab4f8',
        rotation: 0,
        opacity: 1,
        fontWeight: 'bold',
        letterSpacing: 4,
        lineHeight: 1,
        gradient: 'linear-gradient(to right, #8ab4f8, #34a853)',
        shadow: true,
        shadowColor: '#1a73e8',
        shadowBlur: 25,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        x: 140,
        y: 220
      }
    ]
  }
];
