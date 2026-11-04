import confetti from 'canvas-confetti';
import { CloudConfig, PlacedWord } from '../types';
import { renderWordsToCanvas } from './wordCloudEngine';

export function triggerExportConfetti() {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.85 },
      colors: ['#00E5FF', '#FF1744', '#FFEA00', '#76FF03', '#E040FB'],
      disableForReducedMotion: true,
    });
  } catch {
    // Graceful fallback if confetti fails
  }
}

// Download Canvas as crisp PNG
export function downloadCanvasAsPng(
  canvas: HTMLCanvasElement,
  filename = 'Dense_Word_Art.png'
) {
  const dataUrl = canvas.toDataURL('image/png', 1.0);
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  triggerExportConfetti();
}

// Export at high resolution (1x, 2x, 4x)
export async function exportHighResPng(
  words: PlacedWord[],
  config: CloudConfig,
  baseWidth: number,
  baseHeight: number,
  scale: number = 2,
  filename = 'Dense_Word_Art.png'
): Promise<void> {
  const exportCanvas = document.createElement('canvas');
  exportCanvas.width = baseWidth * scale;
  exportCanvas.height = baseHeight * scale;

  const ctx = exportCanvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Could not get export canvas context');

  // Scale placed words for high-res
  const scaledWords: PlacedWord[] = words.map((w) => ({
    ...w,
    x: w.x * scale,
    y: w.y * scale,
    fontSize: w.fontSize * scale,
  }));

  renderWordsToCanvas(ctx, scaledWords, config, baseWidth * scale, baseHeight * scale, 1);

  return new Promise((resolve) => {
    exportCanvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        triggerExportConfetti();
        resolve();
      },
      'image/png',
      1.0
    );
  });
}

// Copy canvas image to system clipboard
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  if (!navigator.clipboard || !window.ClipboardItem) {
    return false;
  }
  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        triggerExportConfetti();
        resolve(true);
      } catch (err) {
        console.error('Failed to copy to clipboard', err);
        resolve(false);
      }
    }, 'image/png');
  });
}

// Generate SVG vector file of the word cloud
export function generateSvg(
  words: PlacedWord[],
  config: CloudConfig,
  width: number,
  height: number
): string {
  const bg = config.backgroundColor || '#080808';
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n`;
  svg += `  <style>\n`;
  svg += `    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&amp;family=Inter:wght@400;700;900&amp;family=JetBrains+Mono:wght@700&amp;family=Space+Grotesk:wght@700&amp;family=Syne:wght@800&amp;family=Playfair+Display:wght@700;900&amp;display=swap');\n`;
  svg += `    .word { font-family: "${config.fontFamily}", sans-serif; }\n`;
  svg += `  </style>\n`;
  svg += `  <rect width="${width}" height="${height}" fill="${bg}" />\n`;

  const palette = config.customColors || [];

  for (const word of words) {
    const rotDeg = (word.rotation * 180) / Math.PI;
    const transform = `translate(${word.x}, ${word.y}) rotate(${rotDeg})`;
    const color = (word.colorIndex !== undefined && palette.length > 0)
      ? palette[word.colorIndex % palette.length]
      : word.color;
    svg += `  <text class="word" transform="${transform}" text-anchor="middle" dominant-baseline="central" font-size="${word.fontSize}" font-weight="${word.fontWeight}" fill="${color}" opacity="${word.opacity}">${escapeXml(word.text)}</text>\n`;
  }

  svg += `</svg>`;
  return svg;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export function downloadSvg(
  words: PlacedWord[],
  config: CloudConfig,
  width: number,
  height: number,
  filename = 'Dense_Word_Art.svg'
) {
  const svgContent = generateSvg(words, config, width, height);
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  triggerExportConfetti();
}
