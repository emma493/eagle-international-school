/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1877F2",
          "blue-hover": "#166FE5",
          "blue-tint": "#E7F3FF",
          green: "#42B72A",
          "green-hover": "#36A420",
          red: "#FA383E",
          amber: "#F7B928",
        },
        neutral: {
          page: "#F0F2F5",
          card: "#FFFFFF",
          hover: "#F2F2F2",
          secondary: "#E4E6EB",
          "secondary-hover": "#D8DADF",
          border: "#DDDFE2",
          divider: "#CED0D4",
          "text-primary": "#1C1E21",
          "text-secondary": "#65676B",
          placeholder: "#8A8D91",
        },
        status: {
          "good-bg": "#E6F4EA",
          "good-text": "#1E7B34",
          "attention-bg": "#FFF4D6",
          "attention-text": "#8A6100",
          "problem-bg": "#FFE5E6",
          "problem-text": "#C2262B",
          "info-bg": "#E7F3FF",
          "info-text": "#1877F2",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        card: "8px",
        input: "6px",
        pill: "12px",
        full: "9999px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.12)",
        login: "0 2px 4px rgba(0,0,0,0.10), 0 8px 16px rgba(0,0,0,0.10)",
        focus: "0 0 0 2px rgba(24,119,242,0.20)",
      },
      spacing: {
        18: "20px",
      },
    },
  },
  plugins: [],
};
