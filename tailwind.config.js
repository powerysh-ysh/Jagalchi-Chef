/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background-color)",
        foreground: "var(--foreground-color)",
        primary: "var(--primary-color)",
        secondary: "var(--secondary-color)",
        surface: "var(--surface-color)",
      },
      fontFamily: {
        sans: ['Inter', 'Pretendard', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
