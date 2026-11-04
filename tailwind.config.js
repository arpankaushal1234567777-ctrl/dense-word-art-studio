/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#080808',
        surface: {
          50: '#1e1e1e',
          100: '#181818',
          200: '#141414',
          300: '#101010',
          card: '#121212',
          cardHover: '#171717',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(255, 255, 255, 0.16)',
        },
        neon: {
          red: '#FF1744',
          cyan: '#00E5FF',
          yellow: '#FFEA00',
          lime: '#76FF03',
          magenta: '#E040FB',
          orange: '#FF9100',
          white: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'SFMono-Regular', 'Menlo', 'monospace'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 229, 255, 0.3)',
        'glow-magenta': '0 0 25px -5px rgba(224, 64, 251, 0.3)',
        'glow-subtle': '0 0 40px -10px rgba(255, 255, 255, 0.05)',
        'canvas-stage': '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 229, 255, 0.06)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
