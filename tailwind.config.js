/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f8fb",
          100: "#e8f0f7",
          200: "#cfe0ef",
          300: "#a8c7e3",
          400: "#7aa7d3",
          500: "#4f87c4",
          600: "#3b6ea9",
          700: "#2f5786",
          800: "#243f61",
          900: "#192b42",
        },
        ink: "#1f2937",
        muted: "#6b7280",
        paper: "#ffffff",
      },
    },
  },
  plugins: [],
}
