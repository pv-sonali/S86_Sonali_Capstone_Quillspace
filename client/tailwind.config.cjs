module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  // 'class' strategy — we add 'dark' class to <html> in main.jsx (#40)
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg': '#0B1120',
        'gold': '#D4A373',
        'text': '#F8FAFC',
        'text-secondary': '#CBD5E1',
        'border': '#334155',
        'button-dark': '#111827',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0B1120 0%, #1a1f3a 50%, #0B1120 100%)',
      },
      spacing: {
        'safe-top': 'max(1rem, env(safe-area-inset-top))',
        'safe-bottom': 'max(1rem, env(safe-area-inset-bottom))',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
