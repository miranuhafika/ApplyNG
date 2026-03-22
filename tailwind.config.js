/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#006400',
          50: '#e6f2e6',
          100: '#ccebcc',
          200: '#99d699',
          300: '#66c266',
          400: '#33ad33',
          500: '#006400',
          600: '#005a00',
          700: '#004d00',
          800: '#004100',
          900: '#003400',
        },
        secondary: {
          DEFAULT: '#228B22',
        },
        accent: {
          DEFAULT: '#FFB84D',
          50: '#fff8ed',
          500: '#FFB84D',
          600: '#e6a544',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
