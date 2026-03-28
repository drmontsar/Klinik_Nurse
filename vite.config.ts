import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [],
      manifest: {
        name: 'KliniK Nurse',
        short_name: 'KliniK Nurse',
        description:
          'Offline-friendly nurse task board for structured ward execution.',
        theme_color: '#0A0E1A',
        background_color: '#0A0E1A',
        display: 'standalone',
        start_url: './',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
})
