/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base:      '#050505',
        secondary: '#111111',
        card:      '#1a1a1a',
        primary:   '#8b5cf6', // Violet
        hover:     '#7c3aed',
        accent:    '#c084fc',
        highlight: '#e9d5ff',
        muted:     '#a1a1aa',
        ink:       '#f8fafc',
        textAccent:'#e2e8f0',
        danger:    '#ef4444',
        success:   '#10b981',
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-base': 'linear-gradient(160deg, #050505 0%, #111111 50%, #0a0a0a 100%)',
        'gradient-primary':  'linear-gradient(135deg, #7c3aed 0%, #c084fc 100%)',
        'gradient-accent':   'linear-gradient(135deg, #c084fc 0%, #e9d5ff 100%)',
        'gradient-card':     'linear-gradient(145deg, rgba(26,26,26,0.6) 0%, rgba(17,17,17,0.8) 100%)',
        'gradient-hero':     'linear-gradient(160deg, #050505 0%, #111111 40%, #1a1a1a 100%)',
        'glass': 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
      },
      boxShadow: {
        'glow':       '0 0 20px rgba(139,92,246,0.30)',
        'glow-lg':    '0 0 40px rgba(139,92,246,0.45)',
        'glow-soft':  '0 0 12px rgba(139,92,246,0.18)',
        'card':       '0 8px 32px rgba(0,0,0,0.40)',
        'card-hover': '0 8px 36px rgba(0,0,0,0.60), 0 0 20px rgba(139,92,246,0.15)',
        'navbar':     '0 4px 30px rgba(0,0,0,0.5)',
        'btn':        '0 2px 12px rgba(139,92,246,0.25)',
        'btn-hover':  '0 4px 24px rgba(139,92,246,0.45)',
        'glass':      'inset 0 1px 1px rgba(255,255,255,0.1)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'shimmer':    'shimmer 2s linear infinite',
        'float':      'float 5s ease-in-out infinite',
        'blob':       'blob 10s ease-in-out infinite',
        'scale-up':   'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn:   { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:  { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        scaleUp:  { '0%': { transform: 'scale(0.95)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        pulseSoft:{
          '0%, 100%': { boxShadow: '0 0 12px rgba(139,92,246,0.20)' },
          '50%':      { boxShadow: '0 0 32px rgba(139,92,246,0.50)' },
        },
        shimmer:  { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } },
        float:    { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-15px)' } },
        blob:     { '0%, 100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.05)' } },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
