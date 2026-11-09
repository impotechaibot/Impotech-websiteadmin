/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#08080a',
        surface: '#121216',
        surface2: '#1a1a20',
        line: '#26262e',
        accent: { DEFAULT: '#f0b429', dark: '#c9920f' },
        ink: { DEFAULT: '#f5f5f7', muted: '#9a9aa5' },
      },
      fontFamily: {
        sans: ['Inter', 'Hind Siliguri', 'system-ui', 'sans-serif'],
      },
      borderRadius: { card: '14px', field: '10px' },
    },
  },
  plugins: [],
};
