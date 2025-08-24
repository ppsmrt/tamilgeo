// notifications.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
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

// 🔹 Show notifications only for logged-in users
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // User not logged in → Show login message
    loginMsg.classList.remove("hidden");
    notificationsContainer.classList.add("hidden");
    emptyState.classList.add("hidden");
    return;
  }

  // User logged in → Show notifications container
  loginMsg.classList.add("hidden");
  notificationsContainer.classList.remove("hidden");

  // Listen for notifications in DB
  const notifRef = ref(db, "notifications");
  onValue(notifRef, (snapshot) => {
    notificationsContainer.innerHTML = ""; // Clear previous

    if (!snapshot.exists()) {
      emptyState.classList.remove("hidden");
      return;
    } else {
      emptyState.classList.add("hidden");
    }

    // Loop through notifications
    const notifications = [];
    snapshot.forEach((child) => {
      notifications.push({ id: child.key, ...child.val() });
    });

    // Sort by timestamp (newest first)
    notifications.sort((a, b) => b.timestamp - a.timestamp);

    // Render notifications
    notifications.forEach((notif) => {
      const card = document.createElement("div");
      card.className =
        "bg-white shadow-md rounded-xl p-4 mb-4 border border-gray-200";

      card.innerHTML = `
        <h2 class="text-lg font-semibold">${notif.title}</h2>
        <p class="text-gray-600">${notif.description}</p>
        ${notif.image ? `<img src="${notif.image}" class="mt-2 rounded-lg"/>` : ""}
        ${
          notif.link
            ? `<a href="${notif.link}" target="_blank" class="text-blue-600 mt-2 block">Read More</a>`
            : ""
        }
        <span class="text-xs text-gray-400 block mt-1">Category: ${notif.category}</span>
      `;

      notificationsContainer.appendChild(card);
    });
  });
});
