// notifications.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// ✅ Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDt86oFFa-h04TsfMWSFGe3UHw26WYoR-U",
  authDomain: "tamilgeoapp.firebaseapp.com",
  databaseURL: "https://tamilgeoapp-default-rtdb.firebaseio.com",
  projectId: "tamilgeoapp",
  storageBucket: "tamilgeoapp.appspot.com",
  messagingSenderId: "1092623024431",
  appId: "1:1092623024431:web:ea455dd68a9fcf480be1da"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Elements
const notificationsContainer = document.getElementById("notificationsContainer");
const loginMsg = document.getElementById("loginMsg");
const emptyState = document.getElementById("emptyState");

// 🔹 Show notifications only for logged-in users
onAuthStateChanged(auth, (user) => {
  if (!user) {
    loginMsg.classList.remove("hidden");
    notificationsContainer.classList.add("hidden");
    return;
  }

  // Listen for notifications
  const notifRef = ref(db, "notifications");
  onValue(notifRef, (snapshot) => {
    notificationsContainer.innerHTML = ""; // Clear old

    if (!snapshot.exists()) {
      emptyState.classList.remove("hidden");
      return;
    } else {
      emptyState.classList.add("hidden");
    }

    snapshot.forEach((child) => {
      const notif = child.val();

      const card = document.createElement("div");
      card.className =
        "bg-white shadow-md rounded-xl p-4 mb-4 border border-gray-200";

      card.innerHTML = `
        <h2 class="text-lg font-semibold">${notif.title}</h2>
        <p class="text-gray-600">${notif.description}</p>
        ${notif.image ? `<img src="${notif.image}" class="mt-2 rounded-lg"/>` : ""}
        ${notif.link ? `<a href="${notif.link}" target="_blank" class="text-blue-600 mt-2 block">Read More</a>` : ""}
        <span class="text-xs text-gray-400 block mt-1">Category: ${notif.category}</span>
      `;

      notificationsContainer.prepend(card); // newest first
    });
  });
});