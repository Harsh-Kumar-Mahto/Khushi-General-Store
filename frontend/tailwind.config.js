/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'wa-green': '#25D366',
        'wa-teal': '#075E54',
        'wa-light-green': '#DCF8C6',
        'wa-bg': '#EFEAE2',
      },
    },
  },
  plugins: [],
};
