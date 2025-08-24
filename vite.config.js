// vite.config.js
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  root: '.',         // 根目录
  build: {
    outDir: 'dist',  // Vite 其他资源打包输出
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
      output: {
        entryFileNames: `[name].js`,     // 保持 main.js 名称不变
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`   // 保留资源文件名
      }
    }
  },
  server: {
    host: true,
    port: 3000,
    allowedHosts: ['37cce864-2a0f-4d2b-b534-038abebad0dc-00-3nb0qnkvczr82.sisko.replit.dev']
  }
})