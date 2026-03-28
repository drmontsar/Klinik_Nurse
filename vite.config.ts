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
        name: 'Klinik-N',
        short_name: 'Klinik-N',
        description:
          'Offline-friendly nurse task board for structured ward execution.',
        theme_color: '#EEF4F0',
        background_color: '#EEF4F0',
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
