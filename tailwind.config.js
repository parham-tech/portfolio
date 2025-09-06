/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
  safelist: [
  'bg-day-gradient',
  'bg-green-gradient',
  'bg-purple-gradient',
  'bg-pink-gradient',
  'bg-blue-gradient',
]

}
