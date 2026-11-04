import React from 'react';
import { WordItem, TextCase } from '../types';
import { RotateCcw, Plus, Trash2, Sliders, Type } from 'lucide-react';

interface WordInputListProps {
  words: WordItem[];
  onChangeWords: (words: WordItem[]) => void;
  textCase: TextCase;
  onChangeTextCase: (textCase: TextCase) => void;
}

const DEFAULT_WORDS: WordItem[] = [
  { id: '1', text: 'PYTHON', weight: 5 },
  { id: '2', text: 'CODE', weight: 4 },
  { id: '3', text: 'ART', weight: 3 },
  { id: '4', text: 'DESIGN', weight: 3 },
  { id: '5', text: 'CREATIVE', weight: 2 },
];

const SUGGESTIONS = [
  'ALGORITHM', 'SYNAPSE', 'FUTURE', 'ABSTRACT', 'COSMIC', 
  'ELEGANCE', 'QUANTUM', 'SPECTRUM', 'DYNAMIC', 'AVANT-GARDE'
];

export const WordInputList: React.FC<WordInputListProps> = ({
  words,
  onChangeWords,
  textCase,
  onChangeTextCase,
}) => {
  const handleTextChange = (index: number, newText: string) => {
    const updated = [...words];
    updated[index] = { ...updated[index], text: newText };
    onChangeWords(updated);
  };

  const handleWeightChange = (index: number, newWeight: number) => {
    const updated = [...words];
    updated[index] = { ...updated[index], weight: newWeight };
    onChangeWords(updated);
  };

  const handleResetDefaults = () => {
    onChangeWords(DEFAULT_WORDS);
  };

  const handleAddWord = () => {
    if (words.length >= 5) return;
    const newWord: WordItem = {
      id: Date.now().toString(),
      text: 'STUDIO',
      weight: 3,
    };
    onChangeWords([...words, newWord]);
  };

  const handleRemoveWord = (index: number) => {
    if (words.length <= 1) return;
    const updated = words.filter((_, i) => i !== index);
    onChangeWords(updated);
  };

  const handleSuggestionClick = (suggested: string) => {
    // Find first empty or lowest weighted word to replace, or append if < 5
    if (words.length < 5) {
      onChangeWords([
        ...words,
        { id: Date.now().toString(), text: suggested, weight: 3 },
      ]);
      return;
    }
    // Replace the last word
    const updated = [...words];
    updated[updated.length - 1] = {
      ...updated[updated.length - 1],
      text: suggested,
    };
    onChangeWords(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
            Custom Words ({words.length}/5)
          </label>
        </div>
        <button
          onClick={handleResetDefaults}
          className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-neutral-200 transition"
          title="Reset to default words"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* 5 Word Input Fields */}
      <div className="space-y-2">
        {words.map((word, idx) => (
          <div
            key={word.id}
            className="group relative flex items-center gap-2 p-1.5 rounded-xl bg-surface-100/90 border border-white/[0.06] hover:border-white/[0.14] focus-within:border-[#00E5FF]/50 focus-within:ring-1 focus-within:ring-[#00E5FF]/30 transition-all duration-200"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-surface-200 text-[10px] font-mono text-neutral-400 select-none">
              {idx + 1}
            </div>

            <input
              type="text"
              value={word.text}
              maxLength={20}
              placeholder={`Word ${idx + 1}...`}
              onChange={(e) => handleTextChange(idx, e.target.value)}
              className="flex-1 bg-transparent text-sm font-medium text-white placeholder-neutral-600 focus:outline-none tracking-wide"
            />

            {/* Word Weight / Scale Pill */}
            <div className="flex items-center gap-1 pr-1">
              <span className="text-[10px] font-mono text-neutral-500 hidden sm:inline">
                Emphasis:
              </span>
              <div className="flex bg-surface-200/80 rounded-lg p-0.5 border border-white/[0.04]">
                {[1, 2, 3, 4, 5].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleWeightChange(idx, w)}
                    className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
                      word.weight === w
                        ? 'bg-[#00E5FF] text-neutral-950 font-bold shadow-sm'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                    title={`Relative emphasis level ${w}`}
                  >
                    {w}x
                  </button>
                ))}
              </div>

              {words.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveWord(idx)}
                  className="p-1 text-neutral-500 hover:text-red-400 transition ml-0.5"
                  title="Remove word"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}

        {words.length < 5 && (
          <button
            type="button"
            onClick={handleAddWord}
            className="w-full py-2 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/10 hover:border-[#00E5FF]/40 text-neutral-400 hover:text-[#00E5FF] text-xs font-medium transition-all duration-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Word ({5 - words.length} remaining)</span>
          </button>
        )}
      </div>

      {/* Text Case Selector */}
      <div className="pt-2 border-t border-white/[0.04]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-neutral-400 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-neutral-500" />
            Text Formatting
          </span>
          <div className="flex items-center gap-1 bg-surface-200 p-0.5 rounded-lg border border-white/[0.06]">
            {(
              [
                { id: 'uppercase', label: 'AA' },
                { id: 'capitalize', label: 'Aa' },
                { id: 'lowercase', label: 'aa' },
                { id: 'original', label: 'Raw' },
              ] as const
            ).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onChangeTextCase(c.id)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  textCase === c.id
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Suggestion tags */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">
            Quick Injections
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.slice(0, 7).map((sugg) => (
              <button
                key={sugg}
                type="button"
                onClick={() => handleSuggestionClick(sugg)}
                className="px-2 py-0.5 rounded-md bg-surface-100 hover:bg-surface-50 text-[10px] font-mono text-neutral-400 hover:text-[#00E5FF] border border-white/[0.04] hover:border-[#00E5FF]/30 transition-all"
              >
                +{sugg}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
