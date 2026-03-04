/* eslint-disable @typescript-eslint/no-unused-vars */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    port: 5173,
    proxy: process.env.CI
      ? undefined
      : {
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
    },
  },
})
