import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ==== 静态文件目录 ====
// 支持 public 目录（main.js、firebase.js、图片、音效、gltf 等）
app.use(express.static(path.join(__dirname, "public")));

// 如果你 build 了 Vite，也可以加 dist
app.use(express.static(path.join(__dirname, "dist")));

// ==== 所有未匹配路由返回 index.html ====
// 注意：必须在静态文件之后，否则会拦截 JS 请求
app.get("*", (req, res) => {
  // 如果 dist 下有 index.html 就返回 dist，否则返回 public
  const indexPathDist = path.join(__dirname, "dist", "index.html");
  const indexPathPublic = path.join(__dirname, "public", "index.html");

  if (require("fs").existsSync(indexPathDist)) {
    res.sendFile(indexPathDist);
  } else {
    res.sendFile(indexPathPublic);
  }
});

// ==== 启动服务器 ====
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
