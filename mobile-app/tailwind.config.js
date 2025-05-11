/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#03314d", // Navy Blue (Main Color)
        secondary: "#ef9c00", // Orange Shade
        background: "#FFFFFF", // White
        section: {
          DEFAULT: "#e5eaed", // for light section backgrounds
          dark: "#d1d5db", // optional dark version if needed
        },
        text: "#1F2937", // Black
        muted: {
          DEFAULT: "#6B7280",
          100: "#E1E6E9",
          light: "#FAFAFA",
        },
        success: "#22c55e",
        error: "#ef4444",
        info: "#3b82f6",
        warning: "#facc15",
      },
      fontFamily: {
        pthin: ["Poppins-Thin", "sans-serif"],
        pextralight: ["Poppins-ExtraLight", "sans-serif"],
        plight: ["Poppins-Light", "sans-serif"],
        pregular: ["Poppins-Regular", "sans-serif"],
        pmedium: ["Poppins-Medium", "sans-serif"],
        psemibold: ["Poppins-SemiBold", "sans-serif"],
        pbold: ["Poppins-Bold", "sans-serif"],
        pextrabold: ["Poppins-ExtraBold", "sans-serif"],
        pblack: ["Poppins-Black", "sans-serif"],
      },
    },
  },
  plugins: [],
};
