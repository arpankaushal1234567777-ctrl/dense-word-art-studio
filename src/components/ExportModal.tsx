import React, { useState } from 'react';
import { CloudConfig, PlacedWord } from '../types';
import { exportHighResPng, downloadSvg, copyCanvasToClipboard } from '../utils/exportUtils';
import { X, Download, FileCode, Check, Copy, Sparkles, Image as ImageIcon } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  words: PlacedWord[];
  config: CloudConfig;
  canvasWidth: number;
  canvasHeight: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  canvasRef,
  words,
  config,
  canvasWidth,
  canvasHeight,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedScale, setSelectedScale] = useState<number>(2);

  if (!isOpen) return null;

  const handleDownloadPng = async (scale: number) => {
    setIsExporting(true);
    try {
      await exportHighResPng(
        words,
        config,
        canvasWidth,
        canvasHeight,
        scale,
        `Dense_Word_Art_${canvasWidth * scale}x${canvasHeight * scale}.png`
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadSvg = () => {
    downloadSvg(words, config, canvasWidth, canvasHeight);
  };

  const handleCopyClipboard = async () => {
    if (!canvasRef.current) return;
    const ok = await copyCanvasToClipboard(canvasRef.current);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-md bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-2xl relative space-y-6"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF]">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Export Artwork</h2>
              <p className="text-xs text-neutral-400">High-fidelity graphics & print-ready formats</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resolution Options */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
            Raster PNG Resolutions
          </label>

          <div className="grid grid-cols-3 gap-2.5">
            {[
              { scale: 1, label: '1x Standard', res: `${canvasWidth}×${canvasHeight}`, badge: 'Fast' },
              { scale: 2, label: '2x Retina', res: `${canvasWidth * 2}×${canvasHeight * 2}`, badge: 'HD' },
              { scale: 4, label: '4x Ultra', res: `${canvasWidth * 4}×${canvasHeight * 4}`, badge: '4K' },
            ].map((opt) => (
              <button
                key={opt.scale}
                type="button"
                onClick={() => setSelectedScale(opt.scale)}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between gap-1.5 ${
                  selectedScale === opt.scale
                    ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-white shadow-glow-cyan'
                    : 'bg-surface-100 hover:bg-surface-50 border-white/[0.06] text-neutral-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold text-white">{opt.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium ${
                    selectedScale === opt.scale ? 'bg-[#00E5FF] text-black font-bold' : 'bg-white/10 text-neutral-300'
                  }`}>
                    {opt.badge}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-neutral-400">{opt.res} px</div>
              </button>
            ))}
          </div>

          <button
            onClick={() => handleDownloadPng(selectedScale)}
            disabled={isExporting}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#00E5FF] to-[#00b4d8] text-neutral-950 font-bold text-sm tracking-tight shadow-glow-cyan hover:shadow-cyan-400/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>
              {isExporting ? 'Synthesizing High-Res PNG...' : `Download ${selectedScale}x PNG (Dense_Word_Art.png)`}
            </span>
          </button>
        </div>

        {/* Alternative Formats */}
        <div className="space-y-2 pt-2 border-t border-white/[0.06]">
          <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
            Vector & Clipboard Formats
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            {/* SVG Vector */}
            <button
              onClick={handleDownloadSvg}
              className="p-3 rounded-2xl bg-surface-100 hover:bg-surface-50 border border-white/[0.06] hover:border-white/20 text-left transition flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <FileCode className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white group-hover:text-purple-300">
                  Scalable SVG
                </div>
                <div className="text-[10px] text-neutral-500">Vector paths</div>
              </div>
            </button>

            {/* Copy Clipboard */}
            <button
              onClick={handleCopyClipboard}
              className="p-3 rounded-2xl bg-surface-100 hover:bg-surface-50 border border-white/[0.06] hover:border-white/20 text-left transition flex items-center gap-3 group"
            >
              <div className="w-8 h-8 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-semibold text-white group-hover:text-green-300">
                  {copied ? 'Copied!' : 'Copy Image'}
                </div>
                <div className="text-[10px] text-neutral-500">To system clipboard</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
