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
  },

  preview: {
    port: 5173,
    strictPort: true,
  }
})
