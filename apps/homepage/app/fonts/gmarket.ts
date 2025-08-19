import localFont from "next/font/local";

export const gmarketSans = localFont({
  src: [
    { path: "./GmarketSansTTFLight.ttf", weight: "300", style: "normal" },
    { path: "./GmarketSansTTFMedium.ttf", weight: "500", style: "normal" },
    { path: "./GmarketSansTTFBold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-gmarket-sans",
  display: "swap", // FOIT 최소화
  preload: true, // early hints / link preload
});
