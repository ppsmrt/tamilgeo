import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDt86oFFa-h04TsfMWSFGe3UHw26WYoR-U",
  authDomain: "tamilgeoapp.firebaseapp.com",
  databaseURL: "https://tamilgeoapp-default-rtdb.firebaseio.com",
  projectId: "tamilgeoapp",
  storageBucket: "tamilgeoapp.appspot.com",
  messagingSenderId: "1092623024431",
  appId: "1:1092623024431:web:ea455dd68a9fcf480be1da"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Card definitions
const cards = [
  { id: "users", icon: "users", color: "green", label: "Users" },
  { id: "likes", icon: "heart", color: "pink", label: "Likes" },
  { id: "comments", icon: "message-circle", color: "blue", label: "Comments" },
  { id: "posts", icon: "file-text", color: "yellow", label: "Posts" },
];

// Create cards dynamically
const grid = document.getElementById("dashboard-grid");
grid.classList.add("grid-cols-2"); // force 2 columns

cards.forEach(card => {
  const div = document.createElement("div");
  div.className = `bg-gradient-to-r from-${card.color}-400 to-${card.color}-600 p-6 shadow-lg rounded-xl transform transition hover:-translate-y-2 flex flex-col items-center justify-center`;
  div.innerHTML = `
    <i data-feather="${card.icon}" class="mb-2 text-white" width="36" height="36"></i>
    <h2 id="${card.id}-count" class="text-3xl font-bold text-white">0</h2>
    <p class="text-white font-semibold mt-1">${card.label}</p>
    <span id="${card.id}-trend" class="text-${card.color}-100 text-sm mt-1">+0 today</span>
  `;
  grid.appendChild(div);
});

// Firebase helpers
function calculateTrend(data) {
  if (!data) return 0;
  const today = new Date().toISOString().slice(0,10);
  let todayCount = 0;
  Object.values(data).forEach(item => {
    if (item.date === today) todayCount++;
  });
  return todayCount;
}

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

// Pull live data
fetchCount("users", "users-count", "users-trend");
fetchCount("likes", "likes-count", "likes-trend");
fetchCount("comments", "comments-count", "comments-trend");
fetchCount("posts", "posts-count", "posts-trend");

// Refresh Feather icons
feather.replace();