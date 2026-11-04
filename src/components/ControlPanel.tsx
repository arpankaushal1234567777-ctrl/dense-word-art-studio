import React, { useState } from 'react';
import { 
  CloudConfig, 
  FontFamily, 
  PaletteId, 
  RotationMode, 
  ShapeMask, 
  AspectRatioId, 
  WordItem,
  TextCase
} from '../types';
import { PALETTES, ASPECT_RATIOS } from '../utils/palettes';
import { WordInputList } from './WordInputList';
import { PresetSelector } from './PresetSelector';
import { 
  Sliders, 
  Palette as PaletteIcon, 
  Maximize2, 
  Compass, 
  Shapes, 
  Sparkles, 
  Type, 
  Zap, 
  Layers,
  ChevronDown
} from 'lucide-react';

interface ControlPanelProps {
  config: CloudConfig;
  onChangeConfig: (newConfig: Partial<CloudConfig>) => void;
  onRandomizeSeed: () => void;
  isGenerating: boolean;
}

const FONTS: { id: FontFamily; label: string; previewClass: string }[] = [
  { id: 'Inter', label: 'Inter (Modern Tech)', previewClass: 'font-sans' },
  { id: 'Space Grotesk', label: 'Space Grotesk (Geometric)', previewClass: 'font-display' },
  { id: 'Bebas Neue', label: 'Bebas Neue (Heavy Display)', previewClass: 'font-sans uppercase font-black' },
  { id: 'JetBrains Mono', label: 'JetBrains Mono (Code/Terminal)', previewClass: 'font-mono' },
  { id: 'Syne', label: 'Syne (Experimental Bold)', previewClass: 'font-sans font-extrabold' },
  { id: 'Playfair Display', label: 'Playfair (Editorial Serif)', previewClass: 'font-serif italic' },
];

const ROTATIONS: { id: RotationMode; label: string; icon: string }[] = [
  { id: 'mixed', label: 'Mixed (75% H / 25% V)', icon: '◫' },
  { id: 'horizontal', label: 'Horizontal Only', icon: '═' },
  { id: 'orthogonal', label: 'Equal Orthogonal (50/50)', icon: '╬' },
  { id: 'dynamic', label: 'Dynamic Angles (45°)', icon: '⤡' },
];

const SHAPES: { id: ShapeMask; label: string }[] = [
  { id: 'full', label: 'Full Frame' },
  { id: 'squircle', label: 'Squircle' },
  { id: 'circle', label: 'Circle' },
  { id: 'heart', label: 'Heart' },
  { id: 'star', label: 'Star' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'hexagon', label: 'Hexagon' },
];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  onChangeConfig,
  onRandomizeSeed,
  isGenerating,
}) => {
  const [activeTab, setActiveTab] = useState<'words' | 'style' | 'layout'>('words');

  return (
    <aside className="w-full lg:w-[400px] shrink-0 border-r border-white/[0.08] bg-[#0d0d0d]/90 backdrop-blur-xl flex flex-col h-full overflow-hidden">
      {/* Tab Switcher Header */}
      <div className="p-3 border-b border-white/[0.06] bg-surface-200/50">
        <div className="grid grid-cols-3 gap-1 p-1 bg-surface-100 rounded-xl border border-white/[0.04]">
          <button
            type="button"
            onClick={() => setActiveTab('words')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'words'
                ? 'bg-neutral-800 text-[#00E5FF] shadow-sm font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Words</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('layout')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'layout'
                ? 'bg-neutral-800 text-[#00E5FF] shadow-sm font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Density</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('style')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'style'
                ? 'bg-neutral-800 text-[#00E5FF] shadow-sm font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <PaletteIcon className="w-3.5 h-3.5" />
            <span>Theme</span>
          </button>
        </div>
      </div>

      {/* Main Scrollable Panel Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6 custom-scrollbar">
        {/* TAB 1: WORDS & PRESETS */}
        {activeTab === 'words' && (
          <div className="space-y-6">
            <WordInputList
              words={config.words}
              onChangeWords={(words) => onChangeConfig({ words })}
              textCase={config.textCase}
              onChangeTextCase={(textCase) => onChangeConfig({ textCase })}
            />

            <PresetSelector
              onSelectPreset={({ words, paletteId, fontFamily }) => {
                onChangeConfig({ words, paletteId, fontFamily });
              }}
            />

            {/* Font Family Selector */}
            <div className="space-y-2 pt-2 border-t border-white/[0.04]">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Type className="w-3.5 h-3.5 text-[#00E5FF]" />
                Typography Engine
              </label>

              <div className="grid grid-cols-1 gap-1.5">
                {FONTS.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => onChangeConfig({ fontFamily: font.id })}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs text-left transition-all ${
                      config.fontFamily === font.id
                        ? 'bg-white/10 border-[#00E5FF]/60 text-white shadow-sm'
                        : 'bg-surface-100 hover:bg-surface-50 border-white/[0.06] text-neutral-300'
                    }`}
                  >
                    <span className="font-medium">{font.label}</span>
                    <span
                      className={`text-sm text-neutral-400 font-bold opacity-80 ${font.previewClass}`}
                    >
                      Ag
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DENSITY & LAYOUT ALGORITHM */}
        {activeTab === 'layout' && (
          <div className="space-y-6">
            {/* Density Slider */}
            <div className="p-3.5 rounded-2xl bg-surface-100 border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#00E5FF]" />
                  Repetition Density
                </label>
                <span className="text-xs font-mono font-bold text-[#00E5FF] px-2 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/20">
                  {config.density}%
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Determines how aggressively words duplicate to pack empty negative spaces.
              </p>
              <input
                type="range"
                min={15}
                max={100}
                value={config.density}
                onChange={(e) => onChangeConfig({ density: Number(e.target.value) })}
                className="w-full accent-[#00E5FF] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-neutral-400 pt-1">
                <span>Sparse (~60 words)</span>
                <span>Max Dense (~500 words)</span>
              </div>
            </div>

            {/* Font Scaling Range (Min & Max) */}
            <div className="p-3.5 rounded-2xl bg-surface-100 border border-white/[0.06] space-y-3">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-[#FFEA00]" />
                Font Size Hierarchy Range
              </label>

              {/* Max Font Size (Hero Words) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Hero Size (Max)</span>
                  <span className="font-mono text-white">{config.maxFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={180}
                  value={config.maxFontSize}
                  onChange={(e) => onChangeConfig({ maxFontSize: Number(e.target.value) })}
                  className="w-full accent-[#FFEA00] cursor-pointer"
                />
              </div>

              {/* Min Font Size (Filler Words) */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Filler Size (Min)</span>
                  <span className="font-mono text-white">{config.minFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={24}
                  value={config.minFontSize}
                  onChange={(e) => onChangeConfig({ minFontSize: Number(e.target.value) })}
                  className="w-full accent-[#FFEA00] cursor-pointer"
                />
              </div>

              {/* Word Padding */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-neutral-400">Word Spacing (Padding)</span>
                  <span className="font-mono text-white">{config.padding}px</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={8}
                  value={config.padding}
                  onChange={(e) => onChangeConfig({ padding: Number(e.target.value) })}
                  className="w-full accent-neutral-300 cursor-pointer"
                />
              </div>
            </div>

            {/* Orientation & Rotation Rule */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#76FF03]" />
                Word Rotation
              </label>

              <div className="grid grid-cols-2 gap-2">
                {ROTATIONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => onChangeConfig({ rotationMode: r.id })}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      config.rotationMode === r.id
                        ? 'bg-white/10 border-[#76FF03]/60 text-white shadow-sm'
                        : 'bg-surface-100 hover:bg-surface-50 border-white/[0.06] text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-sm text-[#76FF03]">{r.icon}</span>
                      {config.rotationMode === r.id && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#76FF03]" />
                      )}
                    </div>
                    <span className="text-[11px] font-medium leading-tight block">
                      {r.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Silhouette Shape Masks */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Shapes className="w-3.5 h-3.5 text-[#E040FB]" />
                Silhouette Mask
              </label>

              <div className="grid grid-cols-3 gap-2">
                {SHAPES.map((shape) => (
                  <button
                    key={shape.id}
                    type="button"
                    onClick={() => onChangeConfig({ shapeMask: shape.id })}
                    className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                      config.shapeMask === shape.id
                        ? 'bg-white/10 border-[#E040FB]/60 text-white shadow-sm font-semibold'
                        : 'bg-surface-100 hover:bg-surface-50 border-white/[0.06] text-neutral-300'
                    }`}
                  >
                    <span className="text-xs capitalize">{shape.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-neutral-400" />
                Canvas Aspect Ratio
              </label>

              <div className="grid grid-cols-2 gap-2">
                {ASPECT_RATIOS.map((aspect) => (
                  <button
                    key={aspect.id}
                    type="button"
                    onClick={() => onChangeConfig({ aspectRatio: aspect.id as AspectRatioId })}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      config.aspectRatio === aspect.id
                        ? 'bg-white/10 border-white/40 text-white shadow-sm'
                        : 'bg-surface-100 hover:bg-surface-50 border-white/[0.06] text-neutral-400'
                    }`}
                  >
                    <div className="text-xs font-semibold text-white">{aspect.label}</div>
                    <div className="text-[10px] text-neutral-500 font-mono">{aspect.sublabel}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: THEME, COLOR PALETTES & NEON GLOW */}
        {activeTab === 'style' && (
          <div className="space-y-6">
            {/* Color Palettes */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <PaletteIcon className="w-3.5 h-3.5 text-[#FF1744]" />
                Neon & Curated Palettes
              </label>

              <div className="space-y-2">
                {PALETTES.map((palette) => (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => onChangeConfig({ paletteId: palette.id })}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all group ${
                      config.paletteId === palette.id
                        ? 'bg-white/10 border-white/30 text-white shadow-md'
                        : 'bg-surface-100 hover:bg-surface-50 border-white/[0.06] text-neutral-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{palette.name}</span>
                        {palette.id === 'neon-pop' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#FF1744]/20 text-[#FF1744] border border-[#FF1744]/30 uppercase font-mono font-bold">
                            Signature
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Color Swatch Dots */}
                    <div className="flex items-center -space-x-1">
                      {palette.colors.map((c, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                          style={{ backgroundColor: c }}
                          title={c}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Neon Tube Glow Controller */}
            <div className="p-4 rounded-2xl bg-surface-100 border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#00E5FF]" />
                  Neon Atmosphere Glow
                </label>

                {/* Apple-style Toggle Switch */}
                <button
                  type="button"
                  onClick={() => onChangeConfig({ neonGlow: !config.neonGlow })}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                    config.neonGlow ? 'bg-[#00E5FF]' : 'bg-neutral-800'
                  }`}
                >
                  <div
                    className={`bg-neutral-950 w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      config.neonGlow ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {config.neonGlow && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-400">Glow Intensity</span>
                    <span className="font-mono text-white">{config.glowIntensity}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={config.glowIntensity}
                    onChange={(e) => onChangeConfig({ glowIntensity: Number(e.target.value) })}
                    className="w-full accent-[#00E5FF] cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Canvas Obsidian Tone */}
            <div className="p-4 rounded-2xl bg-surface-100 border border-white/[0.06] space-y-2">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                Obsidian Background Tone
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Pitch', hex: '#080808' },
                  { label: 'Obsidian', hex: '#0c0c0e' },
                  { label: 'Deep Blue', hex: '#050914' },
                  { label: 'Deep Wine', hex: '#120509' },
                ].map((bg) => (
                  <button
                    key={bg.hex}
                    type="button"
                    onClick={() => onChangeConfig({ backgroundColor: bg.hex })}
                    className={`py-2 rounded-xl border text-center transition-all ${
                      config.backgroundColor === bg.hex
                        ? 'border-[#00E5FF] ring-1 ring-[#00E5FF]/40 text-white font-medium'
                        : 'border-white/[0.06] text-neutral-400 hover:text-white'
                    }`}
                    style={{ backgroundColor: bg.hex }}
                  >
                    <span className="text-[11px] block">{bg.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Bottom Bar with Seed Shuffle */}
      <div className="p-3 border-t border-white/[0.06] bg-[#0c0c0c]/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-neutral-500">Seed: #{config.seed}</span>
        </div>

        <button
          type="button"
          onClick={onRandomizeSeed}
          disabled={isGenerating}
          className="px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-50 text-xs font-medium text-white border border-white/[0.08] hover:border-white/20 transition-all flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
          <span>New Seed</span>
        </button>
      </div>
    </aside>
  );
};
