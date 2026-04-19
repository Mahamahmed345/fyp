import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   proxy: {
  //     // This matches the port 3002 from your server/index.js
  //     '/api': {
  //       target: 'http://localhost:3002',
  //       changeOrigin: true,
  //       secure: false,
  //     },
  //   },
  // },
})