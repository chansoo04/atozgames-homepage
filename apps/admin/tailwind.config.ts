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
      // 모바일은 접두사 없이 ⇒ ‘0px’ 로 선언 안 해도 됨
      // tablet: "640px", // ≥ 640 px
      desktop: "1024px", // ≥ 1024 px
    },
    extend: {
      colors: {
        ...colors,
        transparent: "transparent",
        current: "currentColor",
        primary: {
          DEFAULT: "#2398FF",
          light: "#DCEFFF",
        },
        serve: {
          DEFAULT: "#4F27FF",
          light: "#9F89FF",
        },
        gray: {
          100: "white",
          200: "#F5F5F8",
          300: "#E5E7EF",
          400: "#C7C9D7",
          500: "#ABAEC5",
          600: "#666874",
          700: "#16172D",
        },
      },
      gridTemplateColumns: {
        table: "auto, 1fr",
      },
      fontSize: {
        "2xs": ["0.625rem", "0.75rem"],
        "3xs": ["0.5rem", "0.75rem"],
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-var-requires,@typescript-eslint/no-require-imports
  plugins: [
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@tailwindcss/forms"),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@tailwindcss/typography"),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("@tailwindcss/aspect-ratio"),
  ],
};
