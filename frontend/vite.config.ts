import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 본인의 백엔드 서버 주소 및 포트
        changeOrigin: true,
      }
    }
  }
})