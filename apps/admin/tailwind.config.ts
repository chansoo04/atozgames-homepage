// eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-require-imports
const colors = require("tailwindcss/colors");
delete colors["lightBlue"];
delete colors["warmGray"];
delete colors["trueGray"];
delete colors["coolGray"];
delete colors["blueGray"];

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./graph-form/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ["Pretendard", "-apple-system", "sans-serif"],
    },
    screens: {
      desktop: "768px",
    },
    extend: {
      colors: {
        ...colors,
        transparent: "transparent",
        current: "currentColor",
        primary: {
          DEFAULT: "#9AB6D3",
          50: "#E6EDF4",
          100: "#E6EDF4",
          200: "#CDDAE9",
          300: "#B3C8DE",
          400: "#9AB6D3",
          500: "#81A3C8",
          600: "#6891BD",
          700: "#4F7FB2",
          800: "#356DA7",
          900: "#1C5A9C",
          950: "#034891",
        },
        tempPrimary: {
          DEFAULT: "#4169EF",
          50: "#EEF1F8",
          70: "#B8C7F9",
          200: "#B8C7F9",
          300: "#5E81F6",
          400: "#4169EF",
          500: "#2751DC",
          700: "#0C2B75",
        },
        gray: {
          0: "white",
          50: "#F9F9F9",
          100: "#EFEFEF",
          200: "#D8D8D8",
          300: "#ADADAD" /* 너무 진함. 400에 너무 가까움. 추후 수정 */,
          400: "#A1A1A1",
          500: "#8F8F8F",
          600: "#646464",
          700: "#565656",
          800: "#3E3E3E",
          900: "#1A1A1A",
        },
      },
      gridTemplateColumns: {
        table: "auto, 1fr",
      },
      fontSize: {
        "2xs": ["0.625rem", "0.75rem"],
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-require-imports
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
