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
        // HUN wannaBunyó palette — flag red/green, mustard gold, deep maroon,
        // on the existing near-black ground. See moodboard; hex values are a
        // close visual read of the swatches, nudge them once seen live.
        accent: {
          DEFAULT: '#B8463A', // flag red — primary CTA/highlight color
          light: '#D15A4C',
          dark: '#8F352B',
        },
        brandgreen: {
          DEFAULT: '#3D6B4A', // flag green — "today"/success, MMA marker
          light: '#6FC08A',
          dark: '#2A4D35',
        },
        gold: {
          DEFAULT: '#D4A24A', // mustard — bookmarks, price, stars
          light: '#E0B468',
          dark: '#B3842F',
        },
        maroon: {
          DEFAULT: '#5C1F1F', // deep burgundy — reserved for a future accent (e.g. featured/premium)
          light: '#7A2B2B',
          dark: '#3E1414',
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
        display: ['Fredoka', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-accent': '0 0 20px rgba(184, 70, 58, 0.25)',
        'glow-gold': '0 0 20px rgba(212, 162, 74, 0.25)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  plugins: [],
};
