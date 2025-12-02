// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // FONDOS
        customBackground: "#000000",       // fondo global
        customSurface: "#000000",          // paneles
        customSurfaceElevated: "#161B22",  // tarjetas internas

        // BORDES
        customBorder: "#2A3140",

        // PRIMARIOS CARDANO
        customPrimary: "#0A5AFF",
        customPrimaryDark: "#0031A4",
        customAccent: "#14B7FF",

        // TEXTO
        customText: "#E6E9EF",
        customTextMuted: "#8B9EB6",

        // ERRORES
        customDanger: "#D84C4C",
        
        testColor: "#FF00FF",
      },
    },
  },
  plugins: [],
};
