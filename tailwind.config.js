/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        sand: {
          50: '#fdfcfb',
          100: '#faf7f0',
          200: '#f5ebe0',
          300: '#ecdcc8',
          400: '#e0c8a8',
          500: '#d4b190',
          600: '#c49a78',
          700: '#a97d5f',
          800: '#8b654e',
          900: '#725340',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Work Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
