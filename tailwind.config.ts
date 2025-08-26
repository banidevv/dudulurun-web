import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
        display: ['var(--font-orbitron)', 'Orbitron', 'sans-serif'],
        body: ['var(--font-poppins)', 'Poppins', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#00745D",
        accent: "#F99E06",
        dudulurun: {
          teal: "#04B59B",
          cream: "#F2ECDB",
          white: "#FFFFFF",
          orange: "#F29F05",
          blue: "#099EBB",
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
