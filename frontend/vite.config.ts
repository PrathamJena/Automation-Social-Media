import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Vite blocks requests whose Host header it does not recognise, to
    // stop DNS-rebinding attacks. Sharing the app through a Cloudflare
    // tunnel means the Host header is a random *.trycloudflare.com name
    // that changes every restart, so the allow-list cannot enumerate it.
    //
    // Only the Vite dev server needs this: it is not exposed in a
    // production build, where a real web server handles host checks.
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://backend:8000',
        changeOrigin: true,
      },
    },
  },
})
