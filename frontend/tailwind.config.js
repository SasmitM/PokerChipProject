/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        poker: {
          green: '#0f5132',
          dark: '#1a1a1a',
          gold: '#ffd700',
        }
      }
    },
  },
  plugins: [],
}

