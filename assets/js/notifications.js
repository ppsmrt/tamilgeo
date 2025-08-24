// notifications.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
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
const adminPanel = document.getElementById("adminPanel");
const sendBtn = document.getElementById("sendBtn");
const notificationsContainer = document.getElementById("notificationsContainer"); // 👈 must exist in notifications.html

// 🔹 Show admin panel only if user is admin
onAuthStateChanged(auth, (user) => {
  if (user && user.getIdTokenResult) {
    user.getIdTokenResult().then((idTokenResult) => {
      if (idTokenResult.claims.admin) {
        adminPanel.classList.remove("hidden");
      }
    });
  }
});

// 🔹 Send notification (admin only)
if (sendBtn) {
  sendBtn.addEventListener("click", () => {
    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const image = document.getElementById("image").value.trim();
    const link = document.getElementById("link").value.trim();
    const category = document.getElementById("category").value;

    if (!title || !description) {
      alert("⚠️ Please fill in both title and description.");
      return;
    }

    const notifRef = ref(db, "notifications");
    push(notifRef, {
      title,
      description,
      image: image || null,
      link: link || null,
      category,
      timestamp: Date.now()
    })
      .then(() => {
        alert("✅ Notification sent!");
        document.getElementById("title").value = "";
        document.getElementById("description").value = "";
        document.getElementById("image").value = "";
        document.getElementById("link").value = "";
        document.getElementById("category").value = "General";
      })
      .catch((err) => {
        console.error("Error sending notification:", err);
        alert("❌ Failed to send notification");
      });
  });
}

// 🔹 Display notifications for everyone
if (notificationsContainer) {
  const notifRef = ref(db, "notifications");
  onValue(notifRef, (snapshot) => {
    notificationsContainer.innerHTML = ""; // Clear old

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
}