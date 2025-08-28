// notifications.js
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Elements
const notificationsContainer = document.getElementById("notificationsContainer");
const loginMsg = document.getElementById("loginMsg");
const emptyState = document.getElementById("emptyState");

// Fetch latest 10 posts from WordPress
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

  // Add new posts
  for (const post of recentPosts) {
    if (!existing[post.id]) {
      await set(ref(db, `notifications/${post.id}`), post);
    }
  }

  // Keep only latest 10 posts
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

// Render Notifications
function renderNotifications(user, notifications) {
  notificationsContainer.innerHTML = "";

  if (notifications.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  notifications.forEach((notif, index) => {
    const card = document.createElement("div");
    card.className = "bg-white p-4 rounded shadow relative";

    card.innerHTML = `
      <h2 class="text-lg font-semibold cursor-pointer hover:underline" data-link="${notif.link || ''}">
        ${notif.title}
      </h2>
      <p class="text-gray-500 text-sm">${notif.date}</p>
      ${
        notif.link
          ? `<a href="${notif.link}" target="_blank" class="text-blue-600 text-sm block mt-2">Open Link</a>`
          : ""
      }
      <button class="dismiss absolute top-3 right-3 text-red-500 hover:text-red-700 text-sm">Dismiss</button>
    `;

    notificationsContainer.appendChild(card);

    // ✅ Dismiss action
    card.querySelector(".dismiss").addEventListener("click", () => {
      update(ref(db, `userNotifications/${user.uid}/dismissed/${notif.id}`), { dismissed: true });
    });

    // ✅ Click title to open link
    const titleEl = card.querySelector("h2");
    if (notif.link) {
      titleEl.addEventListener("click", () => {
        window.open(notif.link, "_blank");
      });
    }

    // ✅ Full-width green gradient separator between cards
    if (index < notifications.length - 1) {
      const divider = document.createElement("div");
      divider.style.height = "4px";
      divider.style.width = "100%";
      divider.style.margin = "12px 0";
      divider.style.borderRadius = "2px";
      divider.style.background = "linear-gradient(to right, #00FF00, #008000)";
      notificationsContainer.appendChild(divider);
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

  let allNotifications = [];
  let dismissed = {};

  // Listen dismissed notifications
  onValue(dismissedRef, (dismissedSnap) => {
    dismissed = dismissedSnap.exists() ? dismissedSnap.val() : {};
    renderNotifications(user, allNotifications.filter(n => !dismissed[n.id]));
  });

  // Listen notifications
  onValue(notifRef, (snapshot) => {
    if (!snapshot.exists()) {
      allNotifications = [];
      renderNotifications(user, []);
      return;
    }

    allNotifications = [];
    snapshot.forEach((child) => {
      allNotifications.push({ id: child.key, ...child.val() });
    });

    // Sort latest first
    allNotifications.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    renderNotifications(user, allNotifications.filter(n => !dismissed[n.id]));
  });

  // Update notifications initially and every 5 minutes
  updateNotifications();
  setInterval(updateNotifications, 5 * 60 * 1000); // 5 minutes
});