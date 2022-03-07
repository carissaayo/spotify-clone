module.exports = {
  mode: "jit",
  content: ["./pages/**/*.{html,js}", "./components/**/*.{html,js}"],

  theme: {
    extend: {},
  },
  plugins: [require("tailwind-scrollbar-hide")],
};
