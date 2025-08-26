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
  const backButton = document.createElement("button");
  backButton.onclick = () => {
    if (document.referrer) window.history.back();
    else window.location.href = "index.html";
  };
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
headerSpacer.className = "h-5";
document.body.insertBefore(headerSpacer, header.nextSibling);

// Feather icons init
if (window.feather) feather.replace();

// ===== Load Notifications Count =====
async function updateNotificationCount() {
  let totalUnread = 0;
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

  try {
    const res = await fetch("https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts?per_page=5");
    const posts = await res.json();

    let lastSeen = localStorage.getItem("lastSeenBlogDate") || "";
    let newPosts = posts.filter(p => new Date(p.date) > new Date(lastSeen)).length;

    totalUnread += newPosts;
  } catch (e) {
    console.error("Error fetching blog posts", e);
  }

  if (totalUnread > 0) {
    badge.textContent = totalUnread;
    badge.classList.remove("hidden");
  } else {
    badge.classList.add("hidden");
  }
}

updateNotificationCount();

// ===== Pull-to-Refresh (iOS-style premium) =====
let startY = 0;
let isPulling = false;
const refreshThreshold = 80;
let isRefreshing = false;

const ptrContainer = document.createElement("div");
ptrContainer.style.position = "absolute";
ptrContainer.style.top = "0";
ptrContainer.style.left = "50%";
ptrContainer.style.transform = "translateX(-50%) translateY(-100%)";
ptrContainer.style.width = "40px";
ptrContainer.style.height = "40px";
ptrContainer.style.zIndex = "1000";
ptrContainer.style.transition = "transform 0.2s ease-out";
document.body.prepend(ptrContainer);

// SVG Spinner
const svgNS = "http://www.w3.org/2000/svg";
const svg = document.createElementNS(svgNS, "svg");
svg.setAttribute("width", "40");
svg.setAttribute("height", "40");
svg.setAttribute("viewBox", "0 0 50 50");

const circle = document.createElementNS(svgNS, "circle");
circle.setAttribute("cx", "25");
circle.setAttribute("cy", "25");
circle.setAttribute("r", "20");
circle.setAttribute("fill", "none");
circle.setAttribute("stroke", "#111");
circle.setAttribute("stroke-width", "4");
circle.setAttribute("stroke-linecap", "round");
circle.setAttribute("stroke-dasharray", "125.6");
circle.setAttribute("stroke-dashoffset", "125.6");
circle.style.transition = "stroke-dashoffset 0.2s ease-out";

svg.appendChild(circle);
ptrContainer.appendChild(svg);

// Pull logic
window.addEventListener("touchstart", (e) => {
  if (window.scrollY === 0 && !isRefreshing) {
    startY = e.touches[0].pageY;
    isPulling = true;
  }
});

window.addEventListener("touchmove", (e) => {
  if (!isPulling) return;
  const distance = e.touches[0].pageY - startY;
  if (distance > 0) {
    const translateY = Math.min(distance, refreshThreshold);
    ptrContainer.style.transform = `translateX(-50%) translateY(${translateY}px)`;
    const progress = Math.min(translateY / refreshThreshold, 1);
    const dashoffset = 125.6 * (1 - progress);
    circle.setAttribute("stroke-dashoffset", dashoffset);
  }
});

window.addEventListener("touchend", async (e) => {
  if (!isPulling) return;
  const distance = e.changedTouches[0].pageY - startY;

  if (distance > refreshThreshold) {
    isRefreshing = true;
    ptrContainer.style.transform = `translateX(-50%) translateY(${refreshThreshold}px)`;

    // Start spinning
    circle.style.transition = "stroke-dasharray 0.6s linear infinite, stroke-dashoffset 0.2s ease-out";
    circle.setAttribute("stroke-dasharray", "62.8 62.8");
    circle.setAttribute("stroke-dashoffset", "0");

    await refreshPageContent();

    setTimeout(() => {
      circle.style.transition = "stroke-dashoffset 0.2s ease-out";
      circle.setAttribute("stroke-dasharray", "125.6");
      circle.setAttribute("stroke-dashoffset", "125.6");
      ptrContainer.style.transform = "translateX(-50%) translateY(-100%)";
      isRefreshing = false;
    }, 600);

  } else {
    ptrContainer.style.transform = "translateX(-50%) translateY(-100%)";
  }
  isPulling = false;
});

async function refreshPageContent() {
  await updateNotificationCount();
}