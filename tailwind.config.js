/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        // Board
        board: {
          light: '#e8d5c4',
          dark: '#8b6f47',
          'dark-light': '#2d2416',
          'dark-dark': '#4a3f2e',
        },
        // Pieces
        piece: {
          red: '#e63946',
          'red-dark': '#ff6b6b',
          black: '#1d1d1d',
          white: '#f8f8f8',
        },
        // Gold accent
        gold: {
          DEFAULT: '#f1a208',
          dark: '#ffd700',
        },
      },
      boxShadow: {
        light: '0 1px 3px rgba(0,0,0,0.08)',
        medium: '0 4px 12px rgba(0,0,0,0.12)',
        heavy: '0 8px 24px rgba(0,0,0,0.16)',
        piece: '0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
        'piece-hover': '0 6px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'thinking': 'thinking 1.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        thinking: {
          '0%, 80%, 100%': { transform: 'scale(0.8)', opacity: '0.5' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      letterSpacing: {
        tight: '-0.05em',
        tighter: '-0.03em',
      },
    },
  },
  plugins: [],
}
