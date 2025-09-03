/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        discord: {
          dark: '#36393f',
          darker: '#2f3136',
          darkest: '#202225',
          blurple: '#5865f2',
          green: '#3ba55c',
          yellow: '#faa61a',
          red: '#ed4245',
          gray: '#b9bbbe',
        }
      },
    },
  },
  plugins: [],
}