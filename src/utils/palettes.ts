import { Palette } from '../types';

export const PALETTES: Palette[] = [
  {
    id: 'neon-pop',
    name: 'Neon Pop',
    colors: ['#FF1744', '#00E5FF', '#FFEA00', '#76FF03', '#E040FB', '#FF9100', '#FFFFFF'],
    background: '#080808',
    accent: '#00E5FF',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk 2077',
    colors: ['#FF0055', '#00F0FF', '#FFE600', '#7000FF', '#00FF9F', '#FFFFFF'],
    background: '#08080a',
    accent: '#FF0055',
  },
  {
    id: 'monochrome',
    name: 'Obsidian Minimal',
    colors: ['#FFFFFF', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575', '#424242'],
    background: '#0a0a0a',
    accent: '#FFFFFF',
  },
  {
    id: 'sunset',
    name: 'Sunset Horizon',
    colors: ['#FF4500', '#FF8C00', '#FFD700', '#FF1493', '#FF69B4', '#FFF5EE'],
    background: '#0c070a',
    accent: '#FF8C00',
  },
  {
    id: 'matrix',
    name: 'Matrix Acid',
    colors: ['#00FF66', '#76FF03', '#00E676', '#69F0AE', '#B9F6CA', '#FFFFFF'],
    background: '#040b06',
    accent: '#00FF66',
  },
  {
    id: 'miami',
    name: 'Miami Vice',
    colors: ['#FF007F', '#00F5D4', '#7B2CBF', '#F72585', '#4CC9F0', '#FFFFFF'],
    background: '#080810',
    accent: '#00F5D4',
  },
  {
    id: 'tokyo',
    name: 'Tokyo Glitch',
    colors: ['#F72585', '#7209B7', '#3A0CA3', '#4361EE', '#4CC9F0', '#F15BB5'],
    background: '#06060c',
    accent: '#F72585',
  },
  {
    id: 'gold',
    name: 'Gold Prestige',
    colors: ['#FFD700', '#FFA500', '#F5DEB3', '#DAA520', '#FFF8DC', '#E0A938'],
    background: '#0a0906',
    accent: '#FFD700',
  },
];

export const ASPECT_RATIOS = [
  { id: '1:1', label: '1:1 Square', width: 1400, height: 1400, sublabel: 'Social & Avatar' },
  { id: '16:9', label: '16:9 Widescreen', width: 1920, height: 1080, sublabel: 'Wallpaper & Banner' },
  { id: '9:16', label: '9:16 Portrait', width: 1080, height: 1920, sublabel: 'Phone Wallpaper & Stories' },
  { id: '4:5', label: '4:5 Poster', width: 1200, height: 1500, sublabel: 'Art Print & Instagram' },
  { id: '21:9', label: '21:9 Ultrawide', width: 2100, height: 900, sublabel: 'Header & Ultrawide' },
] as const;

export const PRESET_WORD_PACKS = [
  {
    name: 'Tech & Code',
    words: ['PYTHON', 'CODE', 'ART', 'DESIGN', 'CREATIVE'],
    palette: 'neon-pop',
    font: 'Space Grotesk',
  },
  {
    name: 'Cyberpunk',
    words: ['NEURAL', 'MATRIX', 'CYBER', 'GLITCH', 'SYNAPSE'],
    palette: 'cyberpunk',
    font: 'Bebas Neue',
  },
  {
    name: 'Aesthetic Studio',
    words: ['MINIMAL', 'FORM', 'SPACE', 'BALANCE', 'POETRY'],
    palette: 'monochrome',
    font: 'Playfair Display',
  },
  {
    name: 'Creative Chaos',
    words: ['IMAGINE', 'FLOW', 'DREAM', 'CREATE', 'VIBRANT'],
    palette: 'sunset',
    font: 'Syne',
  },
  {
    name: 'Hacker Terminal',
    words: ['SYSTEM', 'KERNEL', 'PROMPT', 'BINARY', 'ROOT'],
    palette: 'matrix',
    font: 'JetBrains Mono',
  },
  {
    name: 'Neon Metropolis',
    words: ['SHIBUYA', 'LIGHTS', 'DRIFT', 'MIDNIGHT', 'PULSE'],
    palette: 'tokyo',
    font: 'Inter',
  },
];
