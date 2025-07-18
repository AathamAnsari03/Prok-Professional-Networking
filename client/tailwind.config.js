module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0f0f',
        neonBlue: '#00eaff',
        neonPurple: '#a259ff',
        glass: 'rgba(255,255,255,0.08)',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 16px 2px #00eaff, 0 0 32px 4px #a259ff',
        glass: '0 4px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 16px 2px #00eaff, 0 0 32px 4px #a259ff' },
          '50%': { boxShadow: '0 0 32px 8px #a259ff, 0 0 64px 16px #00eaff' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        glow: 'glow 2s infinite alternate',
        pulse: 'pulse 1.2s infinite',
        bounce: 'bounce 1.2s infinite',
      },
    },
  },
  plugins: [],
};
