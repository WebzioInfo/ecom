/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        primary: '#1A3D63',
        secondary: '#FFFFFF',
        accent: '#E6F0FA', // light blue derived from primary
      },
      borderRadius: { DEFAULT: '12px' },
      boxShadow: { soft: '0 4px 12px rgba(0,0,0,0.05)' },
      fontFamily: { sans: ['Inter','system-ui','sans-serif'] },
    },
  },
  plugins: [],
};
