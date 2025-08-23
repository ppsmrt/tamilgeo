import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, get, set, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ---------------- Firebase Config ---------------- //
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
const auth = getAuth(app);
const db = getDatabase(app);

// ---------------- DOM ---------------- //
const adminPanel = document.getElementById("adminPanel");
const statusMsg = document.getElementById("statusMsg");

// Hide by default
adminPanel.classList.add("hidden");
statusMsg.textContent = "⏳ Checking admin access...";
statusMsg.className = "text-center mt-3 text-sm text-gray-500";

// ---------------- Auth Check ---------------- //
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please log in as admin to access this page.");
    window.location.href = "login.html";
    return;
  }

  try {
    // fetch user role from DB
    const snap = await get(ref(db, "users/" + user.uid));
    if (!snap.exists()) {
      alert("Access denied. No user record found.");
      window.location.href = "dashboard.html";
      return;
    }

    const userData = snap.val();
    if (userData.role !== "admin") {
      alert("Access denied. Only admins allowed.");
      window.location.href = "dashboard.html";
      return;
    }

    // ✅ User is admin → show panel
    adminPanel.classList.remove("hidden");
    statusMsg.textContent = "";

  } catch (err) {
    alert("Error verifying admin role: " + err.message);
    window.location.href = "dashboard.html";
  }
});

// ---------------- Notification Creator ---------------- //
async function createNotification({ title, description, message, category, imageUrl, postLink, postId }) {
  const notifRef = push(ref(db, "notifications"));
  const notification = {
    id: notifRef.key,
    title,
    description,
    message,
    category: category || "General",
    imageUrl: imageUrl || "",
    postLink: postLink || "",
    postId: postId || null,
    timestamp: Date.now()
  };
  await set(notifRef, notification);
}

// ---------------- Send Notification ---------------- //
document.getElementById("sendBtn").addEventListener("click", async () => {
  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const imageUrl = document.getElementById("image").value.trim();
  const postLink = document.getElementById("link").value.trim();
  const category = document.getElementById("category").value;

  if (!title || !description) {
    statusMsg.textContent = "⚠️ Title & description are required.";
    statusMsg.className = "text-center mt-3 text-sm text-red-500";
    return;
  }

  try {
    await createNotification({
      title,
      description,
      message: "New admin notification",
      category,
      imageUrl,
      postLink
    });

    statusMsg.textContent = "✅ Notification sent successfully!";
    statusMsg.className = "text-center mt-3 text-sm text-green-600";

    // clear fields
    document.getElementById("title").value = "";
    document.getElementById("description").value = "";
    document.getElementById("image").value = "";
    document.getElementById("link").value = "";
    document.getElementById("category").value = "General";
  } catch (err) {
    statusMsg.textContent = "❌ Failed: " + err.message;
    statusMsg.className = "text-center mt-3 text-sm text-red-500";
  }
});