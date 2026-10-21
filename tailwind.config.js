/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F0F0F',  // Negro elegante
          light: '#2A2A2A',    // Negro más claro
          dark: '#000000',     // Negro puro
        },
        accent: {
          sand: '#D4A574',     // Arena dorada
          coral: '#E08870',    // Coral suave
          green: '#4A7C59',    // Verde palma
        },
        neutral: {
          bg: '#FFFFFF',
          soft: '#FAFAFA',
          border: '#E8E8E8',
          text: '#0F0F0F',
          muted: '#6B6B6B',
        },
        success: '#5A9367',
        warning: '#D4A017',
        error: '#B84A4A',
      },
      fontFamily: {
        serif: ['Georgia', 'serif'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

