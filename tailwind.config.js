/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'om-green': '#a5c7b7', // El verde del header de tu imagen
        'om-gray': '#e5e7eb',
        'om-red': '#b91c1c',
      }
    },
  },
  plugins: [],
}