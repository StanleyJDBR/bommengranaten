/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        ocean: '#0a0e1a',
        hull:  '#1a1225',
        gold: {
          DEFAULT: '#c9922a',
          light:   '#f0c060',
          pale:    '#fde9a0',
        },
        skull: '#e8dcc8',
        blood: {
          DEFAULT: '#8b1a1a',
          light:   '#c0392b',
        },
        foam: '#8ab4be',
      },
      fontFamily: {
        pirata:  ['"Pirata One"', 'cursive'],
        crimson: ['"Crimson Pro"', 'serif'],
        mono:    ['"Space Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
