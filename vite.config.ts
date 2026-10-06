import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // Estrategia de cache offline completa (fila IndexedDB via Dexie.js,
      // sincronizacao - HU08) fica para quando essas telas existirem;
      // por ora so o essencial para o app ser instalavel (RI04/plan.md).
      manifest: {
        name: "Milebag Motorista",
        short_name: "Milebag",
        description: "Aplicação do motorista para devolução de bagagens extraviadas.",
        start_url: "/motorista",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#2563eb",
        lang: "pt-BR",
        icons: [
          { src: "/icone-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icone-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icone-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
          { src: "/icone-app.svg", sizes: "any", type: "image/svg+xml" },
        ],
      },
    }),
  ],
});
