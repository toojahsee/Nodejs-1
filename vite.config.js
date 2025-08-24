import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    allowedHosts: [
      '37cce864-2a0f-4d2b-b534-038abebad0dc-00-3nb0qnkvczr82.sisko.replit.dev'
    ],
    host: true,
    port: 3000
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,   // 保持 main.js 原名
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`
      }
    }
  }
})