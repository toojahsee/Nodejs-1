import { fetchLeaderboard } from "/src/firebase.js";

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

// 点击按钮 → 隐藏大厅 → 运行 main.js
document.getElementById("startBtn").addEventListener("click", () => {
  document.body.innerHTML = ""; // 清空大厅UI
  const script = document.createElement("script");
  script.type = "module";
  script.src = "/src/main.js";
  document.body.appendChild(script);
});
