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
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ["Pretendard", "-apple-system", "sans-serif"],
    },
    screens: {
      desktop: "768px",
      xl: "1100px",
    },
    extend: {
      colors: {
        ...colors,
        transparent: "transparent",
        current: "currentColor",
        // TODO : primary색상 팔레트 만들기
        primary: {
          // DEFAULT: '#7A98FF'
          DEFAULT: "#6485F4",
          50: "#F4F8FF",
          300: "#b8C7F9",
          500: "#5B7EF3",
          700: "#3A63EA",
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
        xxs: ["0.625rem", "0.75rem"],
      },
    },
  },
};
