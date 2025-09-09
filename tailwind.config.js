/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        diagonal: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(10vw, 10vh)' },
        },
        floatCloud: {
          '0%': { transform: 'translateX(-20%)' },
          '100%': { transform: 'translateX(120%)' },
        },
        drift: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out",
        scaleIn: "scaleIn 0.3s ease-out",
        diagonal: 'diagonal 8s linear infinite alternate',
        floatCloud: 'floatCloud 60s linear infinite',
        drift: 'drift 4s ease-in-out infinite alternate',
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  safelist: [
    'bg-day-gradient',
    'bg-green-gradient',
    'bg-purple-gradient',
    'bg-pink-gradient',
    'bg-blue-gradient',
  ],
  plugins: [],
}
