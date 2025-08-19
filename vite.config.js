import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    allowedHosts: [
      '37cce864-2a0f-4d2b-b534-038abebad0dc-00-3nb0qnkvczr82.sisko.replit.dev'
    ],
    host: true, // 让 Vite 接受外部访问
    port: 3000  // 保持和 .replit / Replit 设置一致
  }
})