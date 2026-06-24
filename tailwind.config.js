/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#f5c842',
          500: '#e6b800',
          600: '#b8920a',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
