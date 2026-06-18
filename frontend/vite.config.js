import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "icons/apple-touch-icon.png",
        "icons/icon-192.png",
        "icons/icon-512.png",
        "icons/icon-512-maskable.png",
      ],
      manifest: {
        name:             "Avis et alertes – Ville de Montréal",
        short_name:       "Alertes MTL",
        description:      "Consultez les avis et alertes émis par la Ville de Montréal.",
        start_url:        "/",
        scope:            "/",
        display:          "standalone",
        orientation:      "portrait",
        theme_color:      "#003DA5",
        background_color: "#ffffff",
        lang:             "fr",
        icons: [
          {
            src:   "icons/icon-192.png",
            sizes: "192x192",
            type:  "image/png",
          },
          {
            src:   "icons/icon-512.png",
            sizes: "512x512",
            type:  "image/png",
          },
          {
            src:     "icons/icon-512-maskable.png",
            sizes:   "512x512",
            type:    "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        runtimeCaching: [
          {
            urlPattern: new RegExp(`${process.env.VITE_API_URL ?? "http://localhost:3001"}/avis-alertes`),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "api-alertes-mtl",
              expiration: {
                maxEntries:     100,
                maxAgeSeconds:  60 * 60 * 24,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries:    60,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
        ],
        navigateFallback:        "/index.html",
        navigateFallbackDenylist: [/^\/api/],
      },
      devOptions: { enabled: false },
    }),
  ],
});