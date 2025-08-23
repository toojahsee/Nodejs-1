import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    allowedHosts: [
      // Replit 调试用的域名
      '37cce864-2a0f-4d2b-b534-038abebad0dc-00-3nb0qnkvczr82.sisko.replit.dev'
    ],
    host: true, // 接受外部访问
    port: 3000
  },
  build: {
    outDir: 'dist', // Render 会用 dist 目录作为静态文件
  }
})
