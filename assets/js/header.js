import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// ===== Firebase Config =====
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

// ===== Create Header =====
const header = document.createElement("header");
header.className = "p-5 flex items-center justify-between border-b border-gray-300 shadow-sm bg-white";

// Detect page
const currentPath = window.location.pathname;
const isHome = currentPath.endsWith("index.html") || currentPath === "/" || currentPath === "";

// ----- Left Side -----
const leftDiv = document.createElement("div");
leftDiv.className = "flex items-center space-x-3";

if (isHome) {
  // Logo + TamilGeo
  const logo = document.createElement("img");
  logo.src = "https://ppsmrt.github.io/tamilgeo/assets/icon/Logo.jpg";
  logo.alt = "TamilGeo";
  logo.className = "w-10 h-10 rounded-full";

  const title = document.createElement("h2");
  title.className = "font-bold text-lg";
  title.textContent = "TamilGeo";

  leftDiv.appendChild(logo);
  leftDiv.appendChild(title);

} else {
  // Back arrow + Page title
  const backButton = document.createElement("button");
  backButton.onclick = () => window.location.href = "index.html";
  backButton.className = "text-gray-600 text-xl flex items-center space-x-2";
  backButton.innerHTML = `<i data-feather="chevron-left"></i>`;

  const pageTitle = document.createElement("h2");
  pageTitle.className = "font-bold text-lg";
  let fileName = currentPath.split("/").pop().replace(".html", "");
  pageTitle.textContent = `${fileName.charAt(0).toUpperCase() + fileName.slice(1)}`;

  leftDiv.appendChild(backButton);
  leftDiv.appendChild(pageTitle);
}

// ----- Right Side (Bell Icon) -----
const rightDiv = document.createElement("div");
rightDiv.className = "relative";

const bellButton = document.createElement("button");
bellButton.onclick = () => window.location.href = 'notifications.html';
bellButton.className = "text-gray-600 text-xl relative";
bellButton.innerHTML = `<i class="fas fa-bell text-2xl"></i>`;

const badge = document.createElement("span");
badge.id = "notification-badge";
badge.className = "absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full hidden";
badge.textContent = "0";

rightDiv.appendChild(bellButton);
rightDiv.appendChild(badge);

// ----- Assemble header -----
header.appendChild(leftDiv);
header.appendChild(rightDiv);
document.body.prepend(header);

// ----- Optional spacing below header -----
const headerSpacer = document.createElement("div");
headerSpacer.className = "h-5"; // adjust height as needed
document.body.insertBefore(headerSpacer, header.nextSibling);

// Feather icons init
if (window.feather) {
  feather.replace();
}

// ===== Load Notifications Count (Firebase + Blog) =====
async function updateNotificationCount() {
  let totalUnread = 0;

  // Firebase notifications
  const username = localStorage.getItem("username");
  if (username) {
    const notificationsRef = ref(db, `notifications/${username}`);
    const snapshot = await get(notificationsRef);
    if (snapshot.exists()) {
      const notifications = snapshot.val();
      const unreadCount = Object.values(notifications).filter(n => !n.read).length;
      totalUnread += unreadCount;
    }
  }

  // WordPress Blog posts (RSS feed JSON)
  try {
    const res = await fetch("https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts?per_page=5");
    const posts = await res.json();

    // You can mark blog posts unread until user visits notifications.html
    let lastSeen = localStorage.getItem("lastSeenBlogDate") || "";
    let newPosts = posts.filter(p => new Date(p.date) > new Date(lastSeen)).length;

    totalUnread += newPosts;
  } catch (e) {
    console.error("Error fetching blog posts", e);
  }

  // Update badge
  if (totalUnread > 0) {
    badge.textContent = totalUnread;
    badge.classList.remove("hidden");
  }
}

updateNotificationCount();
