import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // GitLab Pages serves projects under /<project>/. Set PUBLIC_BASE
  // in CI (e.g. "/baguio-trip/") so asset URLs resolve correctly.
  // Defaults to "/" for local dev and root-domain hosting.
  base: process.env.PUBLIC_BASE || '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pine.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Baguio Trip — City of Pines Planner',
        short_name: 'Baguio Trip',
        description: 'Day-by-day itinerary, weather, and map for a trip to Baguio.',
        theme_color: '#1f3326',
        background_color: '#f4f1e9',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        runtimeCaching: [
          {
            // Cache Open-Meteo forecast responses so the app works offline
            urlPattern: /^https:\/\/api\.open-meteo\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'open-meteo-cache',
              expiration: { maxEntries: 32, maxAgeSeconds: 60 * 60 * 6 },
              cacheableResponse: { statuses: [0, 200] }
            }
          },
          {
            // Cache OSM map tiles for offline viewing of already-seen areas
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles-cache',
              expiration: { maxEntries: 600, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0', port: 5173,
    proxy: { '/api': { target: 'http://localhost:3001', changeOrigin: true } }
  },
  preview: { host: '0.0.0.0', port: 4173 }
});
