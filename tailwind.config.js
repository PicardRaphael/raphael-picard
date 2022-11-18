/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable global-require */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontSize: {
      xs: '0.75rem', // 12px
      sm: '0.875rem', // 14px
      base: '1rem', // 16px
      lg: '1.125rem', // 18px
      xl: '1.25rem', // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem', // 48px
      '6xl': '4rem', // 64px
    },
    borderRadius: {
      none: '0',
      sm: '0.25rem', // 4px
      DEFAULT: '0.5rem', // 8px
      medium: '1.25rem', // 20px
      large: '3.125rem', // 50px
      full: '100%',
    },
    extend: {
      fontFamily: {
        sans: ['Lato Black', 'sans-serif'],
      },
      colors: {
        primary: {
          light: '#A074FE',
          lightDark: '#834AFF',
          DEFAULT: '#651FFF',
          darkLight: '#5709FF',
          dark: '#4101CB',
        },
        secondary: {
          light: '#D96AFD',
          lightDark: '#D03CFF',
          DEFAULT: '#C50EFF',
          darkLight: '#C203FF',
          dark: '#9700C7',
        },
        black: {
          500: '#212121', // Principal BG
          600: '#191919',
          700: '#151515',
          800: '#101010',
          900: '#000000', // Text
        },
        gray: {
          300: '#929090', // bg
          400: '#808080', // text
          500: '#5D5D5D', // bg
          600: '#383838', // border
        },
        blue: {
          100: '#ebf8ff',
          200: '#bee3f8',
          300: '#90cdf4',
          400: '#63b3ed',
          500: '#2695f7',
          600: '#3182ce',
          700: '#2b6cb0',
          800: '#2c5282',
          900: '#2a4365',
        },
        red: {
          500: '#f44336',
        },
      },
    },
  },
  variants: {
    extend: {
      fontFamily: ['hover', 'focus'],
    },
  },
  plugins: [require('tailwind-scrollbar'), require('tailwindcss-hyphens')],
  corePlugins: {
    fontFamily: true,
  },
};
