import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0',   // expose on all network interfaces
    proxy: {
      '/api': {
        target: 'http://192.168.1.26:8000',  // use LAN IP so other devices can reach the API
        changeOrigin: true,
      }
    }
  }
})
