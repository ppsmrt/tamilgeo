// ✅ Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDt86oFFa-h04TsfMWSFGe3UHw26WYoR-U",
  authDomain: "tamilgeoapp.firebaseapp.com",
  databaseURL: "https://tamilgeoapp-default-rtdb.firebaseio.com",
  projectId: "tamilgeoapp",
  storageBucket: "tamilgeoapp.appspot.com",
  messagingSenderId: "1092623024431",
  appId: "1:1092623024431:web:ea455dd68a9fcf480be1da"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Helper to calculate trend (today's count)
function calculateTrend(data) {
  if (!data) return 0;
  const today = new Date().toISOString().slice(0,10); // YYYY-MM-DD
  let todayCount = 0;
  Object.values(data).forEach(item => {
    if (item.date === today) todayCount++;
  });
  return todayCount;
}

// Fetch count and trend
function fetchCount(path, countEl, trendEl) {
  const dbRef = ref(db, path);
  onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    const count = data ? Object.keys(data).length : 0;
    document.getElementById(countEl).textContent = count;

    const trend = calculateTrend(data);
    document.getElementById(trendEl).textContent = `+${trend} today`;
  });
}

// Replace these with your actual DB paths
fetchCount("users", "users-count", "users-trend");
fetchCount("likes", "likes-count", "likes-trend");
fetchCount("comments", "comments-count", "comments-trend");
fetchCount("posts", "posts-count", "posts-trend");