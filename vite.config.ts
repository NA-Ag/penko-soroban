import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifestFilename: 'manifest.json',
      includeAssets: ['penguin-soroban-logo.svg', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: "Soroban Master",
        short_name: "Soroban",
        description: "The ultimate Progressive Web App for mastering the Japanese Abacus (Soroban). Features Flash Anzan training, a belt ranking system (Kyu/Dan), an interactive virtual Soroban, and an AI Sensei for technique guidance.",
        start_url: "./",
        display: "standalone",
        background_color: "#0f172a",
        theme_color: "#0f172a",
        icons: [
          {
            src: "./penguin-soroban-logo.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable"
          },
          {
            src: "./pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "./pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.tailwindcss\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tailwind-cdn',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts-webfonts', cacheableResponse: { statuses: [0, 200] } }
          }
        ]
      }
    })
  ],
  base: './',
});