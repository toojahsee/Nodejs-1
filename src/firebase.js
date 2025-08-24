// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// === Firebase 配置 ===
const firebaseConfig = {
  apiKey: 'AIzaSyCf2nPhX8b9_b8lLWqTZU207jlkvPfD_HQ',
  authDomain: 'ezzzz-967db.firebaseapp.com',
  projectId: 'ezzzz-967db',
  storageBucket: 'ezzzz-967db.firebasestorage.app',
  messagingSenderId: '1016963107811',
  appId: '1:1016963107811:web:eaac3ae859787f4e8a2ed6'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 上传分数
export async function uploadScore(name, score){
  try {
    await addDoc(collection(db, 'leaderboard'), { name, score, timestamp: new Date() });
    console.log("分数上传成功:", name, score);
  } catch(e) {
    console.error("上传失败:", e);
  }
}

// 获取排行榜（前10名）
export async function fetchLeaderboard(limitCount = 10){
  try {
    const q = query(collection(db, 'leaderboard'), orderBy('score', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    const entries = [];
    snap.forEach(doc => entries.push(doc.data()));
    return entries;
  } catch(e) {
    console.error("读取排行榜失败:", e);
    return [];
  }
}
