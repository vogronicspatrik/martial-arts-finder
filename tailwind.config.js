/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './types/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0B0B0B',
          2: '#141414',
          3: '#1E1E1E',
          4: '#272727',
        },
        accent: {
          DEFAULT: '#C96A3D',
          light: '#E07A4A',
          dark: '#A85530',
        },
        gold: {
          DEFAULT: '#F2B632',
          light: '#F7C94A',
          dark: '#D99E20',
        },
        ink: {
          100: '#F0EDE8',
          200: '#C8C4BE',
          400: '#8A8480',
          600: '#4A4744',
          700: '#2E2C2A',
          800: '#1E1C1A',
        },
      },
      fontFamily: {
        display: ['Oswald', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(201, 106, 61, 0.25)',
        'glow-gold': '0 0 20px rgba(242, 182, 50, 0.25)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
};
