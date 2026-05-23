/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          900: '#0a0a1a',
          800: '#101028',
          700: '#1a1a2e',
        },
        type: {
          competitor: '#FF4444',
          achiever: '#FFD700',
          socializer: '#00E676',
          explorer: '#448AFF',
          attacker: '#FF6D00',
          guardian: '#00BCD4',
          analyst: '#AA00FF',
          booster: '#FF4081',
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 12px rgba(0, 230, 118, 0.5), 0 0 32px rgba(68, 138, 255, 0.25)',
      },
    },
  },
  plugins: [],
};
