/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        muted: "var(--muted)",

        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-light": "var(--accent-light)",
        "accent-green": "var(--accent-green)",
        "accent-pink": "var(--accent-pink)",

        border: "var(--border)",
      },
    },
  },
};

export default config;