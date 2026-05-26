import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'src/data/images.js',
        'src/main.jsx',
        'src/test/**',
        'src/__tests__/**',
      ],
      // Thresholds reflect a multi-tenant SPA where many components depend on
      // full browser APIs (crypto, fetch, localStorage) and require integration
      // tests rather than unit tests. API serverless functions are excluded.
      // Unit-testable layers (validators, data helpers, pure hooks, form logic)
      // are covered at 80-100%; rendering-heavy components are excluded by design.
      thresholds: { lines: 25, functions: 22, branches: 25 },
    },
    // Prevent import.meta.env errors in tests
    env: {
      VITE_STRIPE_PUBLISHABLE_KEY: 'pk_test_placeholder',
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'screenshots/*.png'],
      manifest: false, // On utilise notre propre public/manifest.json
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
        // Cache les assets statiques (images inline = déjà dans le JS)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false, // Ne pas activer le SW en dev pour éviter les conflits cache
      },
    }),
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 3000,
    open: true,
  },
})
