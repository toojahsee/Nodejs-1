import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ==== 静态文件目录 ====
// 这里 main.js / firebase.js / 图片 / 音效 / gltf 都能访问
app.use(express.static(path.join(__dirname, "public")));

// ==== 前端路由 fallback ====
// 仅对不存在的 URL 返回 lobby.html
app.get("*", (req, res) => {
  const lobbyPath = path.join(__dirname, "public", "index.html");
  res.sendFile(lobbyPath);
});

// ==== 启动服务器 ====
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});