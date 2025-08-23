import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 静态文件目录 (public 和 dist 都要支持)
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "dist"))); // 生产环境 vite build 后的目录

// 所有路由都返回 index.html (支持前端路由)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
