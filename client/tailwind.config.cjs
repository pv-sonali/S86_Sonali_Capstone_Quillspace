module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  // 'class' strategy — we add 'dark' class to <html> in main.jsx (#40)
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bg': '#020617',
        'surface': '#0F172A',
        'card': '#111827',
        'card-hover': '#1E293B',
        'accent': '#6366F1',
        'accent-hover': '#818CF8',
        'text': '#F8FAFC',
        'text-secondary': '#94A3B8',
        'text-muted': '#64748B',
        'border': '#1F2937',
        'success': '#10B981',
        'error': '#EF4444',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #020617 0%, #0F172A 50%, #020617 100%)',
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
