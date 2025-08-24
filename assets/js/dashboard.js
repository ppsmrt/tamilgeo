// ✅ Notifications//
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

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
const notAdmin = document.getElementById("notAdmin");
const sendBtn = document.getElementById("sendBtn");
const logoutBtn = document.getElementById("logoutBtn");

// 🔹 Auth check (show panel only if admin)
onAuthStateChanged(auth, (user) => {
  if (user) {
    user.getIdTokenResult().then((idTokenResult) => {
      if (idTokenResult.claims.admin) {
        adminPanel.classList.remove("hidden");
        notAdmin.classList.add("hidden");
      } else {
        notAdmin.classList.remove("hidden");
        adminPanel.classList.add("hidden");
      }
    });
  } else {
    // Redirect to login if not logged in
    window.location.href = "login.html"; // 👈 change if you use a different login page
  }
});

// 🔹 Send notification
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

// 🔹 Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html"; // redirect after logout
    });
  });
}