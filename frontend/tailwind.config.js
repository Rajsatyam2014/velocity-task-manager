/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        surface: 'rgba(20, 20, 30, 0.6)',
        primary: '#00f0ff',
        secondary: '#ff003c',
        accent: '#9d00ff',
        text: '#e0e0ff',
        muted: '#8080a0',
      },
      backgroundImage: {
        'neon-gradient': 'linear-gradient(135deg, #00f0ff, #9d00ff)',
      },
      boxShadow: {
        'neon': '0 0 10px rgba(0, 240, 255, 0.3), 0 0 20px rgba(157, 0, 255, 0.3)',
      },
    },
  },
  plugins: [],
}
