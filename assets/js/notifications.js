// notifications.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDt86oFFa-h04TsfMWSFGe3UHw26WYoR-U",
  authDomain: "tamilgeoapp.firebaseapp.com",
  databaseURL: "https://tamilgeoapp-default-rtdb.firebaseio.com",
  projectId: "tamilgeoapp",
  storageBucket: "tamilgeoapp.appspot.com",
  messagingSenderId: "1092623024431",
  appId: "1:1092623024431:web:ea455dd68a9fcf480be1da"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// ✅ Elements
const notificationsContainer = document.getElementById("notificationsContainer");
const loginMsg = document.getElementById("loginMsg");
const emptyState = document.getElementById("emptyState");

// ✅ Render Notifications
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

    // Divider (Green)
    if (index < notifications.length - 1) {
      const divider = document.createElement("hr");
      divider.className = "border-t-2 border-green-500 my-2";
      card.appendChild(divider);
    }

    notificationsContainer.appendChild(card);

    // ✅ Dismiss button action
    card.querySelector(".dismiss").addEventListener("click", () => {
      update(ref(db, `userNotifications/${user.uid}/dismissed/${notif.id}`), {
        dismissed: true
      });
    });

    // ✅ Click title to open link if available
    const titleEl = card.querySelector("h2");
    if (notif.link) {
      titleEl.addEventListener("click", () => {
        window.open(notif.link, "_blank");
      });
    }
  });
}

// ✅ Fetch notifications
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

  onValue(dismissedRef, (dismissedSnap) => {
    dismissed = dismissedSnap.exists() ? dismissedSnap.val() : {};
    // Re-render when dismissed updates
    renderNotifications(user, allNotifications.filter(n => !dismissed[n.id]));
  });

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
});