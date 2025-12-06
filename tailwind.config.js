/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '375px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // Custom breakpoint for 1024x768 resolution
        'tablet': '1024px',
        'tablet-landscape': {'raw': '(min-width: 1024px) and (max-height: 768px)'},
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'bounce-slower': 'bounce 4s infinite',
      },
    },
  },
  plugins: [],
}
