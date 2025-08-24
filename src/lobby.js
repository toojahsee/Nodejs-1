import { fetchLeaderboard } from "@/firebase.js";

// 加载排行榜
async function loadLeaderboard() {
  const list = document.getElementById("leaderboardList");
  list.innerHTML = "";
  const data = await fetchLeaderboard(10);
  if (data.length === 0) {
    list.innerHTML = "<li>暂无数据</li>";
    return;
  }
  data.forEach((entry, index) => {
    const li = document.createElement("li");
    li.textContent = `${index + 1}. ${entry.name} - ${entry.score}`;
    list.appendChild(li);
  });
}
loadLeaderboard();

// 点击按钮 → 隐藏大厅 → 动态加载 main.js
document.getElementById("startBtn").addEventListener("click", async () => {
  document.body.innerHTML = ""; // 清空大厅UI
  const mainModule = await import('@/main.js'); // Vite 会解析 @
  // 调用 main.js 导出的启动函数，如果你 main.js 没有导出，可以直接把初始化逻辑放到 main.js 顶部
  // 例如，如果你 main.js 顶部是立即执行逻辑，就直接运行
});