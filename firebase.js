// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from "firebase/firestore";

// === Firebase 配置 ===
const firebaseConfig = {
  apiKey: '',
  authDomain: 'ezzzz-967db.firebaseapp.com',
  projectId: 'ezzzz-967db',
  storageBucket: 'ezzzz-967db.appspot.com',
  messagingSenderId: '1016963107811',
  appId: '1:1016963107811:web:eaac3ae859787f4e8a2ed6'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 上传分数
export async function uploadScore(name, score){
  try {
    await addDoc(collection(db, 'leaderboard'), { name, score, timestamp: serverTimestamp() });
    console.log("分数上传成功:", name, score);
  } catch(e) {
    console.error("上传失败:", e);
  }
}

// 获取排行榜
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
