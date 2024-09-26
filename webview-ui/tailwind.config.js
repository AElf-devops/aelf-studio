/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          100: '#252525',
          200: '#858585',
        },
        'color-divider': '#E6E6E6',
        link: '#266CD3',
        ECEEF2: '#ECEEF2',
        F7: '#F7F8FA',
      },
    },
  },
  plugins: [],
};
