/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        unibud: {
          bg: '#0A0817',
          surface: '#141220',
          surfaceLight: '#1A1730',
          gold: '#C9A84C',
          border: '#2A2840',
          text: '#D0CFDF',
          muted: '#6060A0'
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}