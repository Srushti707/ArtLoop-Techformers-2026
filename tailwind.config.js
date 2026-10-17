/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f5f0e8',
        'canvas-dark': '#ebe3d4',
        ink: '#1a1714',
        'ink-soft': '#3d3730',
        aubergine: '#3d2438',
        'aubergine-dark': '#2a1825',
        'aubergine-light': '#523352',
        coral: '#ff5a3c',
        'coral-soft': '#ff7a5c',
        'coral-dim': '#e04a30',
        muted: '#8a7e6e',
        border: '#d8cdb8',
        'border-soft': '#e5dccb',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-1': ['clamp(3rem, 8vw, 7rem)', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        'display-2': ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '1.0', letterSpacing: '-0.025em' }],
        'display-3': ['clamp(2rem, 4vw, 3.5rem)', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'slide-in': 'slideIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'grain-shift': 'grainShift 0.5s steps(2) infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        grainShift: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(-5%, -5%)' },
        },
      },
    },
  },
  plugins: [],
};
