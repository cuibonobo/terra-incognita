module.exports = {
  mode: "jit",
  content: ["./src/**/*.{html,tsx}"],
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [require('@tailwindcss/typography')],
}
