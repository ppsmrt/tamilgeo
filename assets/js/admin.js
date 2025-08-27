// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, onValue, set, remove, push, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// --- Firebase Config ---
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

const loadingDiv = document.getElementById("loading");
const dashboard = document.getElementById("dashboard");

// --- Only Palani is admin ---
const ADMIN_EMAIL = "ppsmart7@gmail.com";

// Check auth
onAuthStateChanged(auth, (user) => {
  if (!user || user.email !== ADMIN_EMAIL) {
    alert("⚠ Access Denied. Only Admin can view this page.");
    window.location.href = "/tamilgeo/index.html";
    return;
  }

  // Show dashboard if correct admin
  loadingDiv.classList.add("hidden");
  dashboard.classList.remove("hidden");

  initDashboard();
});

// --- Initialize dashboard functions ---
function initDashboard() {
  setupTabs();
  loadPendingPosts();
  loadUsers();
  loadNotifications();
  setupNotificationForm();
}

// --- Tabs ---
function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("bg-green-500", "text-white"));
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.add("bg-gray-300"));
      btn.classList.add("bg-green-500", "text-white");

      const tab = btn.getAttribute("data-tab");
      document.querySelectorAll(".tab-content").forEach(c => c.classList.add("hidden"));
      document.getElementById(tab).classList.remove("hidden");
    });
  });
}

// --- Pending Posts ---
function loadPendingPosts() {
  const postsContainer = document.getElementById("pendingPostsContainer");
  const pendingRef = ref(db, "pendingPosts");

  console.log("🔹 Loading pending posts...");

  onValue(
    pendingRef,
    (snapshot) => {
      const data = snapshot.val();
      console.log("🔹 Firebase snapshot:", data);

      postsContainer.innerHTML = "";

      if (!data) {
        postsContainer.innerHTML =
          "<p class='text-gray-500'>No pending posts.</p>";
        console.log("🔹 No pending posts found.");
        return;
      }

      Object.entries(data).forEach(([id, post]) => {
        console.log(`🔹 Rendering post ID: ${id}`, post);

        const div = document.createElement("div");
        div.className = "bg-white p-4 rounded shadow";
        div.innerHTML = `
          <h3 class="font-semibold text-green-700">${post.title}</h3>
          <p>${post.excerpt}</p>
          <p class="text-sm text-gray-500">By ${post.authorName} • ${new Date(
          post.date
        ).toLocaleString()}</p>
          <div class="mt-2 flex gap-2">
            <button class="approve bg-green-500 text-white px-3 py-1 rounded">Approve</button>
            <button class="reject bg-red-500 text-white px-3 py-1 rounded">Reject</button>
          </div>
        `;
        postsContainer.appendChild(div);

        div.querySelector(".approve").addEventListener("click", async () => {
          console.log(`🔹 Approving post ID: ${id}`);
          try {
            const newRef = push(ref(db, "posts"));
            await set(newRef, { ...post, status: "approved" });
            await remove(ref(db, "pendingPosts/" + id));
            alert("✅ Post approved");
          } catch (err) {
            console.error("❌ Error approving post:", err);
            alert("❌ Failed to approve post. Check console.");
          }
        });

        div.querySelector(".reject").addEventListener("click", async () => {
          console.log(`🔹 Rejecting post ID: ${id}`);
          try {
            await remove(ref(db, "pendingPosts/" + id));
            alert("❌ Post rejected");
          } catch (err) {
            console.error("❌ Error rejecting post:", err);
            alert("❌ Failed to reject post. Check console.");
          }
        });
      });
    },
    (error) => {
      console.error("❌ Firebase read error:", error);
      postsContainer.innerHTML =
        "<p class='text-red-500'>Error loading pending posts.</p>";
    }
  );
}

// --- Manage Users ---
function loadUsers() {
  const usersContainer = document.getElementById("usersContainer");
  const usersRef = ref(db, "users");

  onValue(usersRef, (snapshot) => {
    usersContainer.innerHTML = "";
    const data = snapshot.val();
    if (!data) {
      usersContainer.innerHTML = "<p class='text-gray-500'>No users found.</p>";
      return;
    }

    Object.entries(data).forEach(([uid, user]) => {
      const div = document.createElement("div");
      div.className = "bg-white p-4 rounded shadow flex justify-between items-center";
      div.innerHTML = `
        <div>
          <p class="font-semibold">${user.username || "No username"}</p>
          <p class="text-sm text-gray-500">${user.email}</p>
        </div>
        <button class="reset bg-blue-500 text-white px-3 py-1 rounded">Reset Username</button>
      `;
      usersContainer.appendChild(div);

      div.querySelector(".reset").addEventListener("click", async () => {
        await update(ref(db, "users/" + uid), { username: "resetUser" });
        alert("🔄 Username reset for " + user.email);
      });
    });
  });
}

// --- Manage Notifications ---
function loadNotifications() {
  const notifContainer = document.getElementById("notificationsContainer");
  const notifRef = ref(db, "notifications");

  onValue(notifRef, (snapshot) => {
    notifContainer.innerHTML = "";
    const data = snapshot.val();
    if (!data) {
      notifContainer.innerHTML = "<p class='text-gray-500'>No notifications.</p>";
      return;
    }

    Object.entries(data).forEach(([id, notif]) => {
      const div = document.createElement("div");
      div.className = "bg-white p-4 rounded shadow";
      div.innerHTML = `
        <h3 class="font-semibold text-green-700">${notif.title}</h3>
        <p>${notif.message}</p>
        <p class="text-sm text-gray-500">${new Date(notif.date).toLocaleString()}</p>
      `;
      notifContainer.appendChild(div);
    });
  });
}

// --- Send Notification ---
function setupNotificationForm() {
  const notifForm = document.getElementById("notificationForm");
  notifForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("notifTitle").value.trim();
    const message = document.getElementById("notifMessage").value.trim();
    if (!title || !message) return;

    const newNotifRef = push(ref(db, "notifications"));
    await set(newNotifRef, {
      title,
      message,
      date: new Date().toISOString()
    });
    notifForm.reset();
    alert("📢 Notification sent!");
  });
}