/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
      ],
      theme: {
    extend: {
      colors: {
        primary: {
          orange: '#FF6B35',
            },
      },
    },
  },
  plugins: [],
    }
// Force rebuild
