/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4fd1c5',
          DEFAULT: '#38b2ac',
          dark: '#319795',
        },
        secondary: {
          light: '#ed8936',
          DEFAULT: '#dd6b20',
          dark: '#c05621',
        },
        dark: {
          light: '#2d3748',
          DEFAULT: '#1a202c',
          dark: '#1a202c',
        },
        light: {
          light: '#f7fafc',
          DEFAULT: '#edf2f7',
          dark: '#e2e8f0',
        },
      },
    },
  },
  fontFamily: {
    sans: ['Roboto', 'sans-serif'],
    serif: ['Merriweather', 'serif'],
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
