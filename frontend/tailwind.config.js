/** @type {import('tailwindcss').Config} */
// Design tokens for Eagle International School (see FRONTEND.md section 1).
// Class names used in code must exist here; run `npm run lint:tokens` to check.
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
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
        // Flat aliases: these are the names the components already use
        // (bg-card, border-divider, text-text-primary, text-alert-red ...).
        card: "#FFFFFF",
        divider: "#CED0D4",
        "border-input": "#DDDFE2",
        "text-primary": "#1C1E21",
        "text-secondary": "#65676B",
        "text-placeholder": "#8A8D91",
        "success-green": "#42B72A",
        "success-green-hover": "#36A420",
        "alert-red": "#FA383E",
        "warning-amber": "#F7B928",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      // Type scale: size / line-height (FRONTEND.md section 1)
      fontSize: {
        caption: ["12px", "16px"],
        meta: ["13px", "17px"],
        body: ["15px", "20px"],
        "body-lg": ["17px", "22px"],
        title: ["20px", "24px"],
        display: ["28px", "34px"],
        hero: ["60px", "64px"],
      },
      // Layout sizes. Named so "56" is never mistaken for Tailwind's 56 step (224px).
      spacing: {
        topbar: "56px",
        tabbar: "56px",
        input: "52px",
        btn: "48px",
        "btn-sm": "36px",
        touch: "44px",
        sidebar: "280px",
        rail: "72px",
      },
      // Page content width (PageContainer) and the feed + side column grid (TwoColumn).
      maxWidth: {
        page: "1200px",
        modal: "480px",
        "modal-lg": "640px",
      },
      gridTemplateColumns: {
        "feed-aside": "minmax(0, 1fr) 320px",
      },
      borderRadius: {
        card: "8px",
        input: "6px",
        pill: "12px",
        sheet: "16px",
        full: "9999px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.12)",
        login: "0 2px 4px rgba(0,0,0,0.10), 0 8px 16px rgba(0,0,0,0.10)",
        focus: "0 0 0 2px rgba(24,119,242,0.20)",
      },
      keyframes: {
        "slide-in-left": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "pop-in": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pop-in": "pop-in 150ms ease-out",
        "slide-in-left": "slide-in-left 200ms ease-out",
        "slide-up": "slide-up 200ms ease-out",
        "fade-in": "fade-in 150ms ease-out",
      },
    },
  },
  plugins: [],
};
