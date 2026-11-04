import React from 'react';
import { Sparkles, Download, Shuffle, Layers, Eye } from 'lucide-react';

interface HeaderProps {
  onRandomize: () => void;
  onQuickDownload: () => void;
  isGenerating: boolean;
  wordsCount: number;
  renderTimeMs: number;
}

export const Header: React.FC<HeaderProps> = ({
  onRandomize,
  onQuickDownload,
  isGenerating,
  wordsCount,
  renderTimeMs,
}) => {
  return (
    <header className="h-16 border-b border-white/[0.08] bg-[#0c0c0c]/80 backdrop-blur-xl px-5 flex items-center justify-between sticky top-0 z-40 transition-all">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/15 shadow-inner group">
          <span className="font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#E040FB] text-lg select-none">
            W
          </span>
          <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-[#00E5FF]/20 to-[#E040FB]/20 blur-sm opacity-60 group-hover:opacity-100 transition duration-500 -z-10" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-medium text-sm sm:text-base text-white tracking-tight">
              Dense Word Art Studio
            </h1>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/[0.06] text-neutral-400 border border-white/[0.06] uppercase tracking-wider">
              v1.0
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 hidden sm:block tracking-wide">
            High-density typography synthesis & vector export
          </p>
        </div>
      </div>

      {/* Live Engine Telemetry & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Render stats pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900/80 border border-white/[0.06] text-xs font-mono text-neutral-400">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
          <span>{wordsCount} words</span>
          <span className="text-neutral-600">•</span>
          <span>{renderTimeMs}ms</span>
        </div>

        {/* Randomize / Regenerate button */}
        <button
          onClick={onRandomize}
          disabled={isGenerating}
          title="Regenerate layout with new seed (Spacebar)"
          className="group relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-surface-100 hover:bg-surface-50 active:scale-95 text-xs font-medium text-neutral-200 border border-white/[0.08] hover:border-white/20 transition-all duration-200 shadow-sm"
        >
          <Shuffle
            className={`w-3.5 h-3.5 text-[#00E5FF] group-hover:rotate-180 transition-transform duration-500 ${
              isGenerating ? 'animate-spin' : ''
            }`}
          />
          <span className="hidden sm:inline">Regenerate</span>
        </button>

        {/* Prominent High-Res PNG Download Button */}
        <button
          onClick={onQuickDownload}
          className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00b4d8] text-neutral-950 font-semibold text-xs tracking-tight shadow-glow-cyan hover:shadow-cyan-400/40 active:scale-95 transition-all duration-200"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download High-Res PNG</span>
        </button>
      </div>
    </header>
  );
};
