/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f5f7ff",
          100: "#ebf0fe",
          200: "#d6e0fd",
          300: "#b3c6fb",
          400: "#809df7",
          500: "#4d74f4",
          600: "#1642d8", // Anglican blue
          700: "#1236af",
          800: "#0f2d8e",
          900: "#0f2672",
        },
        accent: {
          light: "#ffd166",
          DEFAULT: "#ef476f",
          dark: "#06d6a0",
        },
        anglican: {
          blue: "#1642d8",
          gold: "#f5b700", // For "Arise, Shine" theme
          red: "#b91c1c",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        display: ["var(--font-montserrat)", "sans-serif"],
        playfair: ["var(--font-playfair)", "serif"],
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        shimmer: "shimmer 2.5s infinite",
        "fade-in-up": "fadeInUp 0.8s ease-out forwards",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        fadeInUp: {
          from: { opacity: 0, transform: "translateY(30px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "anglican-pattern": "url('/images/anglican-pattern.png')", // If you want to add a pattern
        "angular-pattern": "url('/patterns/grid-light.svg')",
        "cross-pattern": "url('/patterns/cross-pattern.svg')",
        "dot-pattern": "url('/patterns/dot-pattern.svg')",
      },
    },
  },
  plugins: [],
};
