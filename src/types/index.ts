export type PaletteId = 
  | 'neon-pop' 
  | 'cyberpunk' 
  | 'monochrome' 
  | 'sunset' 
  | 'matrix' 
  | 'miami' 
  | 'tokyo' 
  | 'gold';

export interface Palette {
  id: PaletteId;
  name: string;
  colors: string[];
  background: string;
  accent: string;
}

export type FontFamily = 
  | 'Inter' 
  | 'Space Grotesk' 
  | 'Bebas Neue' 
  | 'JetBrains Mono' 
  | 'Syne' 
  | 'Playfair Display';

export type RotationMode = 
  | 'horizontal' 
  | 'mixed' 
  | 'orthogonal' 
  | 'dynamic';

export type ShapeMask = 
  | 'full' 
  | 'circle' 
  | 'squircle' 
  | 'heart' 
  | 'star' 
  | 'diamond'
  | 'hexagon';

export type AspectRatioId = '1:1' | '16:9' | '9:16' | '4:5' | '21:9';

export interface AspectRatioOption {
  id: AspectRatioId;
  label: string;
  width: number;
  height: number;
  sublabel: string;
}

export type TextCase = 'uppercase' | 'lowercase' | 'capitalize' | 'original';

export interface WordItem {
  id: string;
  text: string;
  weight: number; // 1 to 5
}

export interface PlacedWord {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  rotation: number; // radians
  color: string;
  colorIndex: number;
  opacity: number;
}

export interface CloudConfig {
  words: WordItem[];
  paletteId: PaletteId;
  customColors?: string[];
  fontFamily: FontFamily;
  fontWeight: number; // 400, 700, 900
  textCase: TextCase;
  density: number; // 10 to 100
  minFontSize: number; // 8 to 24
  maxFontSize: number; // 40 to 180
  padding: number; // 1 to 8
  rotationMode: RotationMode;
  shapeMask: ShapeMask;
  aspectRatio: AspectRatioId;
  seed: number;
  neonGlow: boolean;
  glowIntensity: number;
  backgroundColor: string;
}

export interface GenerationStats {
  wordsPlaced: number;
  totalAttempts: number;
  renderTimeMs: number;
  estimatedFillPercent: number;
}
