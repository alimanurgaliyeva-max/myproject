/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mint: '#B5EAD7',
        lavender: '#C7CEEA',
        peach: '#FFDAC1',
        rose: '#FFB7B2',
        cream: '#FFFFD8',
        'deep-purple': '#6B4FA0',
        'soft-purple': '#9B6DFF',
        'coral': '#FF6B7A',
      },
      fontFamily: {
        display: ['Georgia', 'Times New Roman', 'serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float 6s ease-in-out 2s infinite',
        'float-delay2': 'float 6s ease-in-out 4s infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(5deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(155, 109, 255, 0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(155, 109, 255, 0.8), 0 0 50px rgba(155, 109, 255, 0.4)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(31, 38, 135, 0.15)',
        'glass-hover': '0 12px 40px rgba(31, 38, 135, 0.25)',
        'piece': '0 4px 15px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)',
        'piece-hover': '0 8px 25px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.4)',
        'board': '0 20px 60px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}
