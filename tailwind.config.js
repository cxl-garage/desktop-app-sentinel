/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,ejs}'],
  mode: 'jit',
  theme: {
    extend: {
      spacing: {
        4.5: '1.125rem',
      },
    },
  },
  variants: {},
  plugins: [],
  darkMode: 'class',
};
