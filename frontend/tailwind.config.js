/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      colors: {
        accent: "var(--accent)",
        "accent-hover": "var(--accent-hover)",
        "accent-light": "var(--accent-light)",
      },
    },
  },
};

export default config;
