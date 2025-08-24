// server.js
import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// ==== 静态文件目录 ====
// dist：Vite 打包后的文件
// public：未打包的资源，如图片、音效、gltf
// src：可能有一些模块 JS 需要直接访问
app.use(express.static(path.join(__dirname, "dist")))
app.use(express.static(path.join(__dirname, "public")))
app.use(express.static(path.join(__dirname, "src")))

// ==== 前端路由 fallback ====
// 所有未匹配的请求返回 index.html（dist 优先）
app.get("*", (req, res) => {
  const indexDist = path.join(__dirname, "dist", "index.html")
  const indexPublic = path.join(__dirname, "public", "index.html")
  if (fs.existsSync(indexDist)) {
    res.sendFile(indexDist)
  } else if (fs.existsSync(indexPublic)) {
    res.sendFile(indexPublic)
  } else {
    res.status(404).send("index.html not found")
  }
})

// ==== 启动服务器 ====
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`)
})