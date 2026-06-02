/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1ba5be',
          dark: '#138aa0',
          darker: '#0e8aa0',
        },
      },
    },
  },
  plugins: [],
};
