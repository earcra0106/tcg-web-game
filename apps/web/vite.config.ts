import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  envPrefix: ['VITE_', 'GA_ID'],
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'pwa-192.png',
        'pwa-512.png',
        'assets/sounds/*.mp3',
      ],
      manifest: {
        lang: 'ja',
        name: 'cookers! Factory Game',
        short_name: 'cookers!',
        description:
          '加工ラインを構築して料理を生産するゲーム。限界に挑戦しよう。',
        theme_color: '#F4EAE1',
        background_color: '#F4EAE1',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/pwa-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,mp3,ico,webmanifest}'],
      },
    }),
  ],
});
