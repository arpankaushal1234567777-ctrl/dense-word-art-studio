import React from 'react';
import { PRESET_WORD_PACKS } from '../utils/palettes';
import { PaletteId, FontFamily, WordItem } from '../types';
import { Sparkles } from 'lucide-react';

interface PresetSelectorProps {
  onSelectPreset: (preset: {
    words: WordItem[];
    paletteId: PaletteId;
    fontFamily: FontFamily;
  }) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  onSelectPreset,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
        <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
          Curated Concept Packs
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {PRESET_WORD_PACKS.map((pack) => (
          <button
            key={pack.name}
            type="button"
            onClick={() => {
              const items: WordItem[] = pack.words.map((w, idx) => ({
                id: `${pack.name}-${idx}`,
                text: w,
                weight: 5 - idx,
              }));
              onSelectPreset({
                words: items,
                paletteId: pack.palette as PaletteId,
                fontFamily: pack.font as FontFamily,
              });
            }}
            className="p-2.5 rounded-xl bg-surface-100 hover:bg-surface-50 border border-white/[0.06] hover:border-white/20 text-left transition-all duration-200 group relative overflow-hidden"
          >
            <div className="text-xs font-medium text-white group-hover:text-[#00E5FF] transition-colors truncate">
              {pack.name}
            </div>
            <div className="text-[10px] text-neutral-500 font-mono truncate mt-0.5">
              {pack.words.slice(0, 3).join(', ')}...
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
