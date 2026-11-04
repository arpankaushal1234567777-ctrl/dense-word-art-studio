import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CloudConfig, 
  GenerationStats, 
  PlacedWord, 
  WordItem 
} from './types';
import { ASPECT_RATIOS } from './utils/palettes';
import { generateWordCloud, renderWordsToCanvas } from './utils/wordCloudEngine';
import { downloadCanvasAsPng } from './utils/exportUtils';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { PreviewStage } from './components/PreviewStage';
import { ExportModal } from './components/ExportModal';

const INITIAL_WORDS: WordItem[] = [
  { id: '1', text: 'PYTHON', weight: 5 },
  { id: '2', text: 'CODE', weight: 4 },
  { id: '3', text: 'ART', weight: 3 },
  { id: '4', text: 'DESIGN', weight: 3 },
  { id: '5', text: 'CREATIVE', weight: 2 },
];

const INITIAL_CONFIG: CloudConfig = {
  words: INITIAL_WORDS,
  paletteId: 'neon-pop',
  fontFamily: 'Space Grotesk',
  fontWeight: 800,
  textCase: 'uppercase',
  density: 80,
  minFontSize: 13,
  maxFontSize: 110,
  padding: 2,
  rotationMode: 'mixed',
  shapeMask: 'full',
  aspectRatio: '1:1',
  seed: 1337,
  neonGlow: true,
  glowIntensity: 65,
  backgroundColor: '#080808',
};

export const App: React.FC = () => {
  const [config, setConfig] = useState<CloudConfig>(INITIAL_CONFIG);
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);
  const [stats, setStats] = useState<GenerationStats>({
    wordsPlaced: 0,
    totalAttempts: 0,
    renderTimeMs: 0,
    estimatedFillPercent: 0,
  });
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const isFirstRender = useRef<boolean>(true);

  // Active aspect ratio dimensions
  const activeAspect = ASPECT_RATIOS.find((a) => a.id === config.aspectRatio) || ASPECT_RATIOS[0];
  const canvasWidth = activeAspect.width;
  const canvasHeight = activeAspect.height;

  // Generate word layout
  const computeLayout = useCallback(
    (cfg: CloudConfig) => {
      setIsGenerating(true);
      try {
        const { words, stats: newStats } = generateWordCloud(cfg, canvasWidth, canvasHeight);
        setPlacedWords(words);
        setStats(newStats);

        // Immediately render to canvas if ref is bound
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            renderWordsToCanvas(ctx, words, cfg, canvasWidth, canvasHeight, 1);
          }
        }
      } catch (err) {
        console.error('Word cloud generation error:', err);
      } finally {
        setIsGenerating(false);
      }
    },
    [canvasWidth, canvasHeight]
  );

  // Initial and reactive layout updates
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      computeLayout(config);
      return;
    }

    if (debounceTimerRef.current) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      computeLayout(config);
    }, 35);

    return () => {
      if (debounceTimerRef.current) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    config.words,
    config.density,
    config.minFontSize,
    config.maxFontSize,
    config.padding,
    config.rotationMode,
    config.shapeMask,
    config.aspectRatio,
    config.seed,
    config.fontFamily,
    config.textCase,
    computeLayout,
  ]);

  // Render placed words to Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || placedWords.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderWordsToCanvas(ctx, placedWords, config, canvasWidth, canvasHeight, 1);
  }, [
    placedWords,
    config.paletteId,
    config.neonGlow,
    config.glowIntensity,
    config.backgroundColor,
    canvasWidth,
    canvasHeight,
  ]);

  // Handle configuration changes
  const handleConfigChange = (changes: Partial<CloudConfig>) => {
    setConfig((prev) => ({ ...prev, ...changes }));
  };

  // Reshuffle / Randomize seed and layout
  const handleRandomize = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      seed: Math.floor(Math.random() * 999999) + 1,
    }));
  }, []);

  // Quick download handler
  const handleQuickDownload = useCallback(() => {
    if (!canvasRef.current) return;
    downloadCanvasAsPng(canvasRef.current, 'Dense_Word_Art.png');
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement;

      // Spacebar to randomize if not typing in an input
      if (e.code === 'Space' && !isInput) {
        e.preventDefault();
        handleRandomize();
      }

      // Cmd+S or Ctrl+S to download
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleQuickDownload();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRandomize, handleQuickDownload]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#080808] text-white select-none">
      {/* Top Application Header */}
      <Header
        onRandomize={handleRandomize}
        onQuickDownload={handleQuickDownload}
        isGenerating={isGenerating}
        wordsCount={stats.wordsPlaced}
        renderTimeMs={stats.renderTimeMs}
      />

      {/* Main Split-Screen Dashboard */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left: Configuration Controls Panel (~380-400px) */}
        <ControlPanel
          config={config}
          onChangeConfig={handleConfigChange}
          onRandomizeSeed={handleRandomize}
          isGenerating={isGenerating}
        />

        {/* Right: Live Interactive Canvas Stage (Flex-grow) */}
        <PreviewStage
          canvasRef={canvasRef}
          words={placedWords}
          config={config}
          stats={stats}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          isGenerating={isGenerating}
          onRandomize={handleRandomize}
          onOpenExportModal={() => setIsExportModalOpen(true)}
        />
      </div>

      {/* Export Resolutions & Vector Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        canvasRef={canvasRef}
        words={placedWords}
        config={config}
        canvasWidth={canvasWidth}
        canvasHeight={canvasHeight}
      />
    </div>
  );
};

export default App;
