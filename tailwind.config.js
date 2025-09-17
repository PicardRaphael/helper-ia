/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F4FE',
          100: '#CCE9FD',
          500: '#0a7ea4',
          600: '#0968a3',
          700: '#085d94',
        },
        dark: {
          background: '#151718',
          text: '#ECEDEE',
        },
        light: {
          background: '#fff',
          text: '#11181C',
        }
      },
      fontFamily: {
        'sans': ['system-ui', 'sans-serif'],
        'mono': ['ui-monospace', 'monospace'],
      }
    },
  },
  plugins: [],
}
