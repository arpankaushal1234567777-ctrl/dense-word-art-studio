import { 
  CloudConfig, 
  GenerationStats, 
  PlacedWord, 
  ShapeMask 
} from '../types';
import { PALETTES } from './palettes';

// Fast deterministic Mulberry32 PRNG
export function createPRNG(seed: number) {
  let s = Math.floor(seed);
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Check if a point (px, py) is inside the given shape mask (normalized coords 0..1)
function isPointInMask(px: number, py: number, mask: ShapeMask): boolean {
  // Normalize to -1 .. 1 from center
  const x = (px - 0.5) * 2;
  const y = (py - 0.5) * 2;

  switch (mask) {
    case 'circle': {
      return x * x + y * y <= 0.88;
    }
    case 'squircle': {
      // Superellipse |x|^4 + |y|^4 <= 0.90
      return Math.pow(x, 4) + Math.pow(y, 4) <= 0.90;
    }
    case 'diamond': {
      return Math.abs(x) + Math.abs(y) <= 0.92;
    }
    case 'heart': {
      // Invert y so heart points down
      const hx = x * 1.15;
      const hy = -y * 1.15 + 0.15;
      const a = hx * hx + hy * hy - 0.85;
      return a * a * a - hx * hx * hy * hy * hy <= 0.05;
    }
    case 'star': {
      const angle = Math.atan2(y, x) + Math.PI / 2;
      const r = Math.sqrt(x * x + y * y);
      const points = 5;
      const pAngle = (Math.PI * 2) / points;
      const modAngle = ((angle % pAngle) + pAngle) % pAngle;
      const halfP = pAngle / 2;
      const diff = Math.abs(modAngle - halfP);
      const rMax = 0.42 / Math.cos(diff);
      return r <= Math.min(0.95, rMax * 1.8);
    }
    case 'hexagon': {
      const q2x = Math.abs(x);
      const q2y = Math.abs(y);
      if (q2x > 0.92 || q2y > 0.85) return false;
      return 2 * 0.85 * 0.92 - 0.85 * q2x - Math.sqrt(3) * 0.92 * q2y >= 0;
    }
    case 'full':
    default:
      return Math.abs(x) <= 0.96 && Math.abs(y) <= 0.96;
  }
}

// Test if all 4 corners of a bounding box fit in the shape mask
function isBoxInMask(
  x: number, 
  y: number, 
  w: number, 
  h: number, 
  canvasW: number, 
  canvasH: number, 
  mask: ShapeMask
): boolean {
  if (x < 15 || y < 15 || x + w > canvasW - 15 || y + h > canvasH - 15) {
    return false;
  }

  if (mask === 'full') {
    return true;
  }

  const checkPoints = [
    [x, y],
    [x + w, y],
    [x, y + h],
    [x + w, y + h],
    [x + w / 2, y + h / 2],
  ];

  for (const [px, py] of checkPoints) {
    if (!isPointInMask(px / canvasW, py / canvasH, mask)) {
      return false;
    }
  }
  return true;
}

// Hierarchical spatial occupancy grid for lightning-fast collision detection
class SpatialGrid {
  private cellSize: number;
  private cols: number;
  private rows: number;
  private grid: Uint8Array;

  constructor(width: number, height: number, cellSize: number = 3) {
    this.cellSize = cellSize;
    this.cols = Math.ceil(width / cellSize);
    this.rows = Math.ceil(height / cellSize);
    this.grid = new Uint8Array(this.cols * this.rows);
  }

  isOccupied(x: number, y: number, w: number, h: number): boolean {
    const startCol = Math.max(0, Math.floor(x / this.cellSize));
    const endCol = Math.min(this.cols - 1, Math.floor((x + w) / this.cellSize));
    const startRow = Math.max(0, Math.floor(y / this.cellSize));
    const endRow = Math.min(this.rows - 1, Math.floor((y + h) / this.cellSize));

    for (let r = startRow; r <= endRow; r++) {
      const rowOffset = r * this.cols;
      for (let c = startCol; c <= endCol; c++) {
        if (this.grid[rowOffset + c] === 1) {
          return true;
        }
      }
    }
    return false;
  }

  mark(x: number, y: number, w: number, h: number): void {
    const startCol = Math.max(0, Math.floor(x / this.cellSize));
    const endCol = Math.min(this.cols - 1, Math.floor((x + w) / this.cellSize));
    const startRow = Math.max(0, Math.floor(y / this.cellSize));
    const endRow = Math.min(this.rows - 1, Math.floor((y + h) / this.cellSize));

    for (let r = startRow; r <= endRow; r++) {
      const rowOffset = r * this.cols;
      for (let c = startCol; c <= endCol; c++) {
        this.grid[rowOffset + c] = 1;
      }
    }
  }

  getFilledRatio(): number {
    let filled = 0;
    const len = this.grid.length;
    for (let i = 0; i < len; i++) {
      if (this.grid[i] === 1) filled++;
    }
    return filled / len;
  }
}

// Transform text according to user casing option
function transformText(text: string, textCase: CloudConfig['textCase']): string {
  switch (textCase) {
    case 'uppercase':
      return text.toUpperCase();
    case 'lowercase':
      return text.toLowerCase();
    case 'capitalize':
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    case 'original':
    default:
      return text;
  }
}

// Generate the dense word cloud layout
export function generateWordCloud(
  config: CloudConfig,
  canvasWidth: number,
  canvasHeight: number
): { words: PlacedWord[]; stats: GenerationStats } {
  const startTime = performance.now();
  const rng = createPRNG(config.seed);

  // Active palette
  const palette = PALETTES.find(p => p.id === config.paletteId) || PALETTES[0];
  const colorPool = (config.customColors && config.customColors.length > 0)
    ? config.customColors
    : palette.colors;

  // Filter valid words
  const validWords = config.words
    .map(w => ({ ...w, text: transformText(w.text.trim(), config.textCase) }))
    .filter(w => w.text.length > 0);

  if (validWords.length === 0) {
    return {
      words: [],
      stats: {
        wordsPlaced: 0,
        totalAttempts: 0,
        renderTimeMs: 0,
        estimatedFillPercent: 0,
      },
    };
  }

  // Create offscreen canvas for accurate text measurement
  const measureCanvas = document.createElement('canvas');
  const mctx = measureCanvas.getContext('2d');
  if (!mctx) {
    throw new Error('Canvas 2D context not supported');
  }

  // Cache text dimensions for speed
  const measureCache = new Map<string, { width: number; height: number }>();
  function getWordDimensions(text: string, fontSize: number, weight: number): { width: number; height: number } {
    const key = `${text}_${fontSize}_${weight}_${config.fontFamily}`;
    if (measureCache.has(key)) {
      return measureCache.get(key)!;
    }
    mctx!.font = `${weight} ${fontSize}px "${config.fontFamily}", sans-serif`;
    const metrics = mctx!.measureText(text);
    const width = Math.ceil(metrics.width);
    // Reliable font height approximation
    const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.78;
    const descent = metrics.actualBoundingBoxDescent || fontSize * 0.22;
    const height = Math.ceil(ascent + descent);
    const res = { width, height };
    measureCache.set(key, res);
    return res;
  }

  // Number of candidate words driven by Density slider (scale from 80 to 520)
  const densityRatio = config.density / 100;
  const targetCandidateCount = Math.floor(70 + densityRatio * 450);

  interface WordCandidate {
    text: string;
    targetFontSize: number;
    weight: number;
    userWeight: number;
    tier: 'hero' | 'medium' | 'filler';
  }

  const wordQueue: WordCandidate[] = [];

  // Sort user words descending by weight
  const sortedUserWords = [...validWords].sort((a, b) => b.weight - a.weight);
  const totalUserWeight = sortedUserWords.reduce((acc, w) => acc + w.weight, 0);

  // 1. Hero tier: 1 to 2 focal instances per user word
  sortedUserWords.forEach((word) => {
    const weightBoost = word.weight / 3.0; // 0.33 to 1.66
    const heroSize = Math.round(
      Math.min(
        config.maxFontSize * 1.1,
        Math.max(config.minFontSize * 2.5, config.maxFontSize * (0.8 + weightBoost * 0.2))
      )
    );
    wordQueue.push({
      text: word.text,
      targetFontSize: heroSize,
      weight: 900,
      userWeight: word.weight,
      tier: 'hero',
    });
  });

  // 2. Medium tier: 25 to 60 words
  const mediumCount = Math.round(20 + densityRatio * 40);
  for (let i = 0; i < mediumCount; i++) {
    // Pick word weighted by user priority
    let randVal = rng() * totalUserWeight;
    let selectedWord = sortedUserWords[0];
    for (const w of sortedUserWords) {
      if (randVal <= w.weight) {
        selectedWord = w;
        break;
      }
      randVal -= w.weight;
    }

    const t = i / Math.max(1, mediumCount - 1);
    const mediumSize = Math.round(
      config.minFontSize * 1.8 + Math.pow(1 - t, 1.4) * (config.maxFontSize * 0.65 - config.minFontSize * 1.8)
    );

    const weights = [600, 700, 800];
    const weight = weights[Math.floor(rng() * weights.length)];

    wordQueue.push({
      text: selectedWord.text,
      targetFontSize: mediumSize,
      weight,
      userWeight: selectedWord.weight,
      tier: 'medium',
    });
  }

  // 3. Filler tier: 50 to 420 small words to densely saturate negative space
  const fillerCount = Math.max(30, targetCandidateCount - wordQueue.length);
  for (let i = 0; i < fillerCount; i++) {
    let randVal = rng() * totalUserWeight;
    let selectedWord = sortedUserWords[0];
    for (const w of sortedUserWords) {
      if (randVal <= w.weight) {
        selectedWord = w;
        break;
      }
      randVal -= w.weight;
    }

    const jitter = 0.9 + rng() * 0.3;
    const fillerSize = Math.max(
      config.minFontSize,
      Math.round((config.minFontSize + rng() * (config.minFontSize * 0.9)) * jitter)
    );

    const weights = [500, 600, 700];
    const weight = weights[Math.floor(rng() * weights.length)];

    wordQueue.push({
      text: selectedWord.text,
      targetFontSize: fillerSize,
      weight,
      userWeight: selectedWord.weight,
      tier: 'filler',
    });
  }

  // Sort queue by font size descending so large words establish strong anchors first
  wordQueue.sort((a, b) => b.targetFontSize - a.targetFontSize);

  // Initialize Spatial Grid (3px cell resolution)
  const gridCellSize = 3;
  const grid = new SpatialGrid(canvasWidth, canvasHeight, gridCellSize);

  const placedWords: PlacedWord[] = [];
  let totalAttempts = 0;
  const padding = Math.max(1, config.padding);

  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const aspect = canvasWidth / canvasHeight;
  const maxRadius = Math.hypot(canvasWidth / 2, canvasHeight / 2) * 0.94;

  // Decide rotation angles based on mode
  function getCandidateRotation(tier: WordCandidate['tier'], mode: CloudConfig['rotationMode']): number {
    if (mode === 'horizontal') return 0;
    if (tier === 'hero') {
      // 85% horizontal for heroes to preserve focal legibility
      return rng() > 0.85 ? Math.PI / 2 : 0;
    }
    switch (mode) {
      case 'orthogonal':
        return rng() > 0.5 ? Math.PI / 2 : 0;
      case 'dynamic': {
        const roll = rng();
        if (roll < 0.55) return 0;
        if (roll < 0.82) return Math.PI / 2;
        return rng() > 0.5 ? Math.PI / 4 : -Math.PI / 4;
      }
      case 'mixed':
      default:
        // Python wordcloud standard: ~75% horizontal, 25% vertical
        return rng() > 0.75 ? Math.PI / 2 : 0;
    }
  }

  // Place each candidate along expanding Archimedean spirals
  for (const candidate of wordQueue) {
    const rotation = getCandidateRotation(candidate.tier, config.rotationMode);
    const isRotated = Math.abs(rotation - Math.PI / 2) < 0.01;
    const isDiagonal = Math.abs(rotation) > 0.1 && !isRotated;

    // Retry loop with progressive font size reduction if crowded
    const maxAttemptsAtSize = candidate.tier === 'hero' ? 2 : 1;
    let placed = false;

    for (let sizeAttempt = 0; sizeAttempt < maxAttemptsAtSize && !placed; sizeAttempt++) {
      const currentFontSize = Math.max(
        config.minFontSize,
        Math.round(candidate.targetFontSize * (1 - sizeAttempt * 0.22))
      );

      const { width: textW, height: textH } = getWordDimensions(
        candidate.text,
        currentFontSize,
        candidate.weight
      );

      let boxW: number;
      let boxH: number;

      if (isRotated) {
        boxW = textH + padding * 2;
        boxH = textW + padding * 2;
      } else if (isDiagonal) {
        const diag = Math.ceil((textW + textH) * 0.7071);
        boxW = diag + padding * 2;
        boxH = diag + padding * 2;
      } else {
        boxW = textW + padding * 2;
        boxH = textH + padding * 2;
      }

      // Starting origin for the spiral
      let curCenterX = centerX;
      let curCenterY = centerY;

      if (candidate.tier === 'medium') {
        curCenterX = centerX + (rng() - 0.5) * (canvasWidth * 0.25);
        curCenterY = centerY + (rng() - 0.5) * (canvasHeight * 0.25);
      } else if (candidate.tier === 'filler') {
        // Distribute filler origins across canvas clusters to quickly find empty pockets
        const clusterRoll = rng();
        if (clusterRoll > 0.4) {
          curCenterX = centerX + (rng() - 0.5) * (canvasWidth * 0.7);
          curCenterY = centerY + (rng() - 0.5) * (canvasHeight * 0.7);
        }
      }

      let r = 0;
      let angle = rng() * Math.PI * 2;
      const maxSteps = candidate.tier === 'filler' ? 180 : 380;
      const radialStep = candidate.tier === 'filler' ? 1.4 : 1.7;

      for (let step = 0; step < maxSteps; step++) {
        totalAttempts++;
        if (r > maxRadius) break;

        const px = curCenterX + r * Math.cos(angle) * aspect - boxW / 2;
        const py = curCenterY + r * Math.sin(angle) - boxH / 2;

        r += radialStep;
        angle += 0.35 + 8 / (r + 10);

        // Check boundary and shape mask
        if (!isBoxInMask(px, py, boxW, boxH, canvasWidth, canvasHeight, config.shapeMask)) {
          continue;
        }

        // Check spatial occupancy
        if (!grid.isOccupied(px, py, boxW, boxH)) {
          grid.mark(px, py, boxW, boxH);

          // Assign color index from accent palette
          const colorIndex = Math.floor(rng() * 1000);
          const color = colorPool[colorIndex % colorPool.length];
          const opacity = candidate.tier === 'hero' 
            ? 1.0 
            : candidate.tier === 'medium' 
              ? 0.92 + rng() * 0.08 
              : 0.82 + rng() * 0.18;

          placedWords.push({
            text: candidate.text,
            x: px + boxW / 2,
            y: py + boxH / 2,
            width: textW,
            height: textH,
            fontSize: currentFontSize,
            fontFamily: config.fontFamily,
            fontWeight: candidate.weight,
            rotation,
            color,
            colorIndex,
            opacity,
          });

          placed = true;
          break;
        }
      }
    }
  }

  const renderTimeMs = Math.round((performance.now() - startTime) * 10) / 10;
  const estimatedFillPercent = Math.min(98, Math.round(grid.getFilledRatio() * 100 * 2.8));

  return {
    words: placedWords,
    stats: {
      wordsPlaced: placedWords.length,
      totalAttempts,
      renderTimeMs,
      estimatedFillPercent,
    },
  };
}

// Render the placed words to a HTML5 canvas
export function renderWordsToCanvas(
  ctx: CanvasRenderingContext2D,
  words: PlacedWord[],
  config: CloudConfig,
  canvasWidth: number,
  canvasHeight: number,
  pixelRatio: number = 1
): void {
  ctx.save();
  ctx.scale(pixelRatio, pixelRatio);

  const palette = PALETTES.find(p => p.id === config.paletteId) || PALETTES[0];
  const bg = config.backgroundColor || palette.background || '#080808';

  // Draw solid dark background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Subtle obsidian vignette
  const gradient = ctx.createRadialGradient(
    canvasWidth / 2,
    canvasHeight / 2,
    canvasHeight * 0.15,
    canvasWidth / 2,
    canvasHeight / 2,
    canvasWidth * 0.72
  );
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.03)');
  gradient.addColorStop(0.65, 'rgba(0, 0, 0, 0.2)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Optional subtle shape silhouette outline
  if (config.shapeMask !== 'full') {
    ctx.save();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    drawMaskPath(ctx, canvasWidth, canvasHeight, config.shapeMask);
    ctx.stroke();
    ctx.restore();
  }

  // Draw placed words
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const colorPool = (config.customColors && config.customColors.length > 0)
    ? config.customColors
    : palette.colors;

  for (const word of words) {
    ctx.save();
    ctx.translate(word.x, word.y);
    if (word.rotation !== 0) {
      ctx.rotate(word.rotation);
    }

    // Resolve color dynamically based on current active palette
    const activeColor = (word.colorIndex !== undefined && colorPool.length > 0)
      ? colorPool[word.colorIndex % colorPool.length]
      : word.color;

    ctx.font = `${word.fontWeight} ${word.fontSize}px "${word.fontFamily}", sans-serif`;
    ctx.fillStyle = activeColor;
    ctx.globalAlpha = word.opacity;

    // Neon tube glow effect
    if (config.neonGlow) {
      ctx.shadowColor = activeColor;
      ctx.shadowBlur = Math.min(22, Math.max(3, word.fontSize * 0.28 * (config.glowIntensity / 50)));
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    ctx.fillText(word.text, 0, 0);

    // If neon glow is on and word is large, do a second crisp pass to keep core razor sharp
    if (config.neonGlow && word.fontSize > 32) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = activeColor;
      ctx.fillText(word.text, 0, 0);
    }

    ctx.restore();
  }

  ctx.restore();
}

// Draw the vector path of the shape mask for visual aid
function drawMaskPath(ctx: CanvasRenderingContext2D, w: number, h: number, mask: ShapeMask): void {
  const cx = w / 2;
  const cy = h / 2;
  const rx = (w / 2) * 0.92;
  const ry = (h / 2) * 0.92;

  ctx.beginPath();
  switch (mask) {
    case 'circle':
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      break;
    case 'squircle': {
      const radius = Math.min(rx, ry) * 0.42;
      const left = cx - rx;
      const top = cy - ry;
      const width = rx * 2;
      const height = ry * 2;
      ctx.roundRect(left, top, width, height, radius);
      break;
    }
    case 'diamond':
      ctx.moveTo(cx, cy - ry);
      ctx.lineTo(cx + rx, cy);
      ctx.lineTo(cx, cy + ry);
      ctx.lineTo(cx - rx, cy);
      ctx.closePath();
      break;
    case 'heart': {
      ctx.moveTo(cx, cy + ry * 0.7);
      ctx.bezierCurveTo(cx - rx * 1.1, cy, cx - rx * 0.8, cy - ry * 0.8, cx, cy - ry * 0.2);
      ctx.bezierCurveTo(cx + rx * 0.8, cy - ry * 0.8, cx + rx * 1.1, cy, cx, cy + ry * 0.7);
      break;
    }
    case 'hexagon': {
      const a = (2 * Math.PI) / 6;
      for (let i = 0; i < 6; i++) {
        const hx = cx + rx * Math.cos(a * i - Math.PI / 6);
        const hy = cy + ry * Math.sin(a * i - Math.PI / 6);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      break;
    }
    default:
      ctx.rect(20, 20, w - 40, h - 40);
  }
}
