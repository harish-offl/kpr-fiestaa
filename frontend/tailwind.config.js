module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        primary: '#0F3D2E',
        secondary: '#1C2541',
        accent: '#3EC1D3',
        success: '#2A9D8F',
        warning: '#F4A261',
        background: '#F7F6F2',
        charcoal: '#1F1F1F',
        muted: '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(62, 193, 211, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(62, 193, 211, 0.8)' },
        },
      },
    },
  },
  plugins: [],
};
