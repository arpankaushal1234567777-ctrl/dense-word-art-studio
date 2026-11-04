import React, { useRef, useState, useEffect } from 'react';
import { 
  CloudConfig, 
  PlacedWord, 
  GenerationStats 
} from '../types';
import { 
  Download, 
  Shuffle, 
  Maximize, 
  Minimize, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Copy, 
  Check, 
  MoreVertical,
  Sparkles,
  Info
} from 'lucide-react';
import { downloadCanvasAsPng, copyCanvasToClipboard } from '../utils/exportUtils';

interface PreviewStageProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  words: PlacedWord[];
  config: CloudConfig;
  stats: GenerationStats;
  canvasWidth: number;
  canvasHeight: number;
  isGenerating: boolean;
  onRandomize: () => void;
  onOpenExportModal: () => void;
}

export const PreviewStage: React.FC<PreviewStageProps> = ({
  canvasRef,
  words,
  config,
  stats,
  canvasWidth,
  canvasHeight,
  isGenerating,
  onRandomize,
  onOpenExportModal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isFading, setIsFading] = useState<boolean>(false);

  // Trigger subtle smooth transition on regeneration
  useEffect(() => {
    setIsFading(true);
    const timer = setTimeout(() => setIsFading(false), 200);
    return () => clearTimeout(timer);
  }, [config.seed, words.length]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(2.0, prev + 0.15));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(0.5, prev - 0.15));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.error(err));
      setIsFullscreen(false);
    }
  };

  const handleQuickDownload = () => {
    if (!canvasRef.current) return;
    downloadCanvasAsPng(canvasRef.current, 'Dense_Word_Art.png');
  };

  const handleCopy = async () => {
    if (!canvasRef.current) return;
    const success = await copyCanvasToClipboard(canvasRef.current);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <main
      ref={containerRef}
      className={`flex-1 flex flex-col relative h-full min-h-[500px] overflow-hidden bg-[#080808] ${
        isFullscreen ? 'p-6 bg-black' : 'p-3 sm:p-6'
      }`}
    >
      {/* Top Floating Stage HUD */}
      <div className="flex items-center justify-between gap-3 mb-3 z-10">
        {/* Stats Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-surface-100/80 backdrop-blur-md border border-white/[0.06] text-xs font-mono text-neutral-300 shadow-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-glow-cyan animate-pulse" />
            <span className="font-semibold text-white">{stats.wordsPlaced}</span>
            <span className="text-neutral-500">words</span>
          </div>
          <span className="text-neutral-700">|</span>
          <div className="flex items-center gap-1">
            <span className="text-neutral-500">Density:</span>
            <span className="text-[#76FF03] font-semibold">{stats.estimatedFillPercent}%</span>
          </div>
          <span className="text-neutral-700 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1">
            <span className="text-neutral-500">Time:</span>
            <span className="text-[#FFEA00]">{stats.renderTimeMs}ms</span>
          </div>
        </div>

        {/* Floating Quick Action Group */}
        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="hidden sm:flex items-center bg-surface-100/80 backdrop-blur-md rounded-xl border border-white/[0.06] p-1 shadow-sm">
            <button
              onClick={handleZoomOut}
              disabled={zoomLevel <= 0.5}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 text-[10px] font-mono text-neutral-300 hover:text-white"
              title="Reset Zoom to 100%"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={zoomLevel >= 2.0}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-surface-100/80 backdrop-blur-md border border-white/[0.06] hover:border-white/20 text-neutral-400 hover:text-white transition shadow-sm"
            title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
          >
            {isFullscreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
          </button>

          {/* Copy Image Button */}
          <button
            onClick={handleCopy}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-100/80 backdrop-blur-md border border-white/[0.06] hover:border-white/20 text-xs font-medium text-neutral-300 hover:text-white transition shadow-sm"
            title="Copy image directly to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* More Export Options */}
          <button
            onClick={onOpenExportModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-100/80 backdrop-blur-md border border-white/[0.06] hover:border-white/20 text-xs font-medium text-neutral-300 hover:text-white transition shadow-sm"
            title="Export resolutions & vector SVG"
          >
            <MoreVertical className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Options</span>
          </button>
        </div>
      </div>

      {/* Interactive Canvas Stage Centerpiece */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-white/[0.04] bg-gradient-to-b from-[#0b0b0b] to-[#050505] p-2 sm:p-6 shadow-inner">
        {/* Subtle decorative grid backdrop */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Ambient neon backdrop glow matching palette */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-[140px] opacity-15 pointer-events-none transition-all duration-700"
          style={{
            backgroundColor: config.neonGlow ? '#00E5FF' : 'transparent',
          }}
        />

        {/* Canvas Stage Frame */}
        <div 
          className="relative flex items-center justify-center transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel})`,
            height: 'min(calc(100vh - 220px), calc(100vw - 480px), 720px)',
            maxWidth: '100%',
            aspectRatio: `${canvasWidth} / ${canvasHeight}`,
          }}
        >
          {/* Canvas Wrapper with drop shadow and smooth fade transition */}
          <div
            className={`w-full h-full relative rounded-2xl overflow-hidden shadow-canvas-stage border border-white/[0.08] transition-opacity duration-300 ${
              isFading ? 'opacity-85 scale-[0.998]' : 'opacity-100 scale-100'
            }`}
          >
            {/* Live HTML5 Canvas */}
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              className="w-full h-full block bg-[#080808]"
              style={{
                imageRendering: 'auto',
              }}
            />

            {/* Loading / Generating Overlay */}
            {isGenerating && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center transition-all duration-300">
                <div className="flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-surface-100 border border-white/10 shadow-2xl">
                  <div className="w-6 h-6 border-2 border-[#00E5FF] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-mono text-neutral-300 tracking-wider">
                    COMPUTING DENSE PACKING...
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="mt-3 flex items-center justify-between gap-3 z-10">
        <div className="text-[11px] font-mono text-neutral-500 hidden sm:block">
          Canvas: {canvasWidth} × {canvasHeight} px • Press <kbd className="px-1 py-0.5 rounded bg-white/10 text-neutral-300 font-sans">Space</kbd> to Randomize
        </div>

        {/* Center / Right Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          {/* Regenerate Button with Fade Animation */}
          <button
            onClick={onRandomize}
            disabled={isGenerating}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-surface-100 hover:bg-surface-50 active:scale-95 text-xs font-medium text-white border border-white/[0.08] hover:border-white/20 transition-all shadow-sm"
          >
            <Shuffle className={`w-3.5 h-3.5 text-[#00E5FF] ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Randomize Layout</span>
          </button>

          {/* Prominent High-Res PNG Download Button */}
          <button
            onClick={handleQuickDownload}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00b4d8] text-neutral-950 font-bold text-xs tracking-tight shadow-glow-cyan hover:shadow-cyan-400/50 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Res PNG</span>
          </button>
        </div>
      </div>
    </main>
  );
};
