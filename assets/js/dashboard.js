import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, get, child, push } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// Elements
const adminPanel = document.getElementById("adminPanel");
const notAdmin = document.getElementById("notAdmin");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");

// Auth check (show panel only if role === "admin")
onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const snapshot = await get(child(ref(db), `users/${user.uid}/role`));
      const role = snapshot.val();

      if (role === "admin") {
        if (adminPanel) adminPanel.classList.remove("hidden");
        if (notAdmin) notAdmin.classList.add("hidden");
      } else {
        if (notAdmin) notAdmin.classList.remove("hidden");
        if (adminPanel) adminPanel.classList.add("hidden");
      }
    } catch (err) {
      console.error("Error checking role:", err);
    }
  } else {
    window.location.href = "login.html";
  }
});

// Send notification
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
      alert("✅ Notification sent successfully!");
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

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    }).catch((error) => {
      console.error("Logout error:", error);
    });
  });
}
