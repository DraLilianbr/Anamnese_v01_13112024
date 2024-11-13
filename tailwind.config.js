/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1594a4',
          light: '#30a0ac',
        },
        secondary: '#a2d4d8',
        accent: {
          DEFAULT: '#94cccc',
          light: '#b7dcdc',
        },
        background: {
          light: '#f8fafc',
          DEFAULT: '#f1f5f9',
        }
      },
      boxShadow: {
        'custom': '0 4px 6px -1px rgba(21, 148, 164, 0.1), 0 2px 4px -1px rgba(21, 148, 164, 0.06)',
        'input': '0 2px 4px -1px rgba(21, 148, 164, 0.06)',
      },
    },
  },
  plugins: [],
};