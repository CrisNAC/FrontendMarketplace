/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    proxy: {
        "/api": {
          target: "http://localhost:3000",
          changeOrigin: true,
          secure: false,
          selfHandleResponse: false,
          configure: (proxy, _options) => {
            proxy.on("proxyRes", (proxyRes, _req, res) => {
              if (proxyRes.statusCode === 401) {
                console.log("No autenticado, redirigiendo...");
                res.writeHead(401, {
                  Location: "/login",
                });
                res.end();
                return;
              }
              proxyRes.pipe(res);
            });
          },
        },
        "/products": { // agregue esto para que funcionen algunas rutas que no llevan /api, ver eso luego y unificar
          target: "http://localhost:3000",
          changeOrigin: true,
          secure: false,
        }
      },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    exclude: [
      '**/node_modules/**',
      '**/tests/**',       
      '**/*.e2e.spec.*',  
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx,ts,tsx}'],
      exclude: [
        // Entry points y configuración — sin lógica de negocio
        'src/main.tsx',
        'src/App.tsx',
        'src/**/*.d.ts',
        // Archivos de test
        'src/test/**',
        // Layouts — sólo estructura visual, sin lógica
        'src/layouts/**',
        // Páginas de error estáticas
        'src/pages/errors/**',
      ],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },

  preview: {
    port: 5173,
    strictPort: true,
  }
})
