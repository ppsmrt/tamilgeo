import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue, set, get, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Firebase Config
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
const auth = getAuth(app);

const notificationsContainer = document.getElementById("notificationsContainer");
const loginMsg = document.getElementById("loginMsg");
const emptyState = document.getElementById("emptyState");

// Fetch recent 10 posts
async function fetchRecentPosts() {
  try {
    const response = await fetch("https://tamilgeo.wordpress.com/wp-json/wp/v2/posts?per_page=10&_embed");
    const posts = await response.json();
    return posts.map(post => ({
      id: post.id,
      title: post.title.rendered,
      date: new Date(post.date).toLocaleDateString(),
      link: post.link,
      timestamp: new Date(post.date).getTime()
    }));
  } catch (error) {
    console.error("Error fetching WordPress posts:", error);
    return [];
  }
}

// Update Firebase notifications
async function updateNotifications() {
  const notifRef = ref(db, "notifications");
  const recentPosts = await fetchRecentPosts();

  const snapshot = await get(notifRef);
  const existing = snapshot.exists() ? snapshot.val() : {};

  for (const post of recentPosts) {
    if (!existing[post.id]) {
      await set(ref(db, `notifications/${post.id}`), post);
    }
  }

  // Keep latest 10
  const allIds = Object.keys(existing).concat(recentPosts.map(p => p.id));
  const uniqueIds = [...new Set(allIds)];
  const sortedIds = uniqueIds
    .sort((a, b) => ((existing[b]?.timestamp || 0) - (existing[a]?.timestamp || 0)))
    .slice(0, 10);

  const updates = {};
  sortedIds.forEach(id => {
    updates[id] = existing[id] || recentPosts.find(p => p.id == id);
  });

  await set(notifRef, updates);
}

// Render notifications with "New" badge
function renderNotifications(user, notifications, seenMap) {
  notificationsContainer.innerHTML = "";

  if (notifications.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  notifications.forEach((notif, index) => {
    const card = document.createElement("div");
    card.className = "notification-card";

    // Check if notification is new for this user
    const isNew = !seenMap[notif.id];

    card.innerHTML = `
      <h2 class="text-lg font-semibold cursor-pointer hover:underline flex items-center justify-between">
        <span>${notif.title}</span>
        ${isNew ? `<span class="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">New</span>` : ''}
      </h2>
      <p class="text-gray-500 text-sm mt-1">${notif.date}</p>
      ${notif.link ? `<a href="${notif.link}" target="_blank" class="text-blue-600 text-sm block mt-2">Open Link</a>` : ''}
      <button class="dismiss absolute top-3 right-3 text-red-500 hover:text-red-700 text-sm">Dismiss</button>
    `;

    notificationsContainer.appendChild(card);

    // Dismiss
    card.querySelector(".dismiss").addEventListener("click", () => {
      update(ref(db, `userNotifications/${user.uid}/dismissed/${notif.id}`), { dismissed: true });
    });

    // Open link
    const titleEl = card.querySelector("h2 span");
    if (notif.link) {
      titleEl.addEventListener("click", () => window.open(notif.link, "_blank"));
    }

    // Divider
    if (index < notifications.length - 1) {
      const divider = document.createElement("div");
      divider.className = "gradient-divider";
      notificationsContainer.appendChild(divider);
    }
  });

  // Mark all displayed notifications as seen
  notifications.forEach(n => {
    if (!seenMap[n.id]) {
      update(ref(db, `userNotifications/${user.uid}/seen/${n.id}`), { seen: true });
    }
  });
}

// Auth listener
onAuthStateChanged(auth, (user) => {
  if (!user) {
    loginMsg.classList.remove("hidden");
    notificationsContainer.classList.add("hidden");
    emptyState.classList.add("hidden");
    return;
  }

  loginMsg.classList.add("hidden");
  notificationsContainer.classList.remove("hidden");

  const notifRef = ref(db, "notifications");
  const dismissedRef = ref(db, `userNotifications/${user.uid}/dismissed`);
  const seenRef = ref(db, `userNotifications/${user.uid}/seen`);

  let allNotifications = [];
  let dismissed = {};
  let seenMap = {};

  onValue(dismissedRef, (snap) => {
    dismissed = snap.exists() ? snap.val() : {};
    renderNotifications(user, allNotifications.filter(n => !dismissed[n.id]), seenMap);
  });

  onValue(seenRef, (snap) => {
    seenMap = snap.exists() ? snap.val() : {};
    renderNotifications(user, allNotifications.filter(n => !dismissed[n.id]), seenMap);
  });

  onValue(notifRef, (snap) => {
    allNotifications = [];
    if (snap.exists()) {
      snap.forEach(child => allNotifications.push({ id: child.key, ...child.val() }));
    }
    allNotifications.sort((a,b) => (b.timestamp || 0) - (a.timestamp || 0));
    renderNotifications(user, allNotifications.filter(n => !dismissed[n.id]), seenMap);
  });

  updateNotifications();
  setInterval(updateNotifications, 5*60*1000);
});