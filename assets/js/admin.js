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

// --- Admin Email ---
const ADMIN_EMAIL = "ppsmart7@gmail.com";

// --- Check Admin Auth ---
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("⚠ Access Denied. Login required.");
    window.location.href = "/tamilgeo/login.html";
    return;
  }

  if (user.email !== ADMIN_EMAIL) {
    alert("⚠ Access Denied. Only Admin can view this page.");
    window.location.href = "/tamilgeo/index.html";
    return;
  }

  loadingDiv.classList.add("hidden");
  dashboard.classList.remove("hidden");
  initDashboard();
});

// --- Initialize Dashboard ---
function initDashboard() {
  setupTabs();
  loadPendingPosts();
  loadNotifications();
  setupNotificationForm();
}

// --- Tabs ---
function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => {
        b.classList.remove("bg-green-500", "text-white");
        b.classList.add("bg-gray-300");
      });
      btn.classList.add("bg-green-500", "text-white");

      const tab = btn.getAttribute("data-tab");
      document.querySelectorAll(".tab-content").forEach(c => c.classList.add("hidden"));
      document.getElementById(tab).classList.remove("hidden");
    });
  });
}

// --- Load Pending Posts ---
function loadPendingPosts() {
  const postsContainer = document.getElementById("pendingPostsContainer");
  const pendingRef = ref(db, "pendingPosts");

  onValue(pendingRef, (snapshot) => {
    postsContainer.innerHTML = "";
    if (!snapshot.exists()) {
      postsContainer.innerHTML = "<p class='text-gray-500'>No pending posts.</p>";
      return;
    }

    const data = snapshot.val();
    Object.entries(data).forEach(([id, post]) => {
      const div = document.createElement("div");
      div.className = "bg-white p-4 rounded shadow";
      div.innerHTML = `
        <h3 class="font-semibold text-green-700">${post.title}</h3>
        <p>${post.excerpt}</p>
        <p class="text-sm text-gray-500">By ${post.authorName} • ${new Date(post.date).toLocaleString()}</p>
        <div class="mt-2 flex gap-2">
          <button class="edit bg-yellow-500 text-white px-3 py-1 rounded">Edit</button>
          <button class="approve bg-green-500 text-white px-3 py-1 rounded">Approve</button>
          <button class="reject bg-red-500 text-white px-3 py-1 rounded">Reject</button>
        </div>
      `;
      postsContainer.appendChild(div);

      // Edit Post
      div.querySelector(".edit").addEventListener("click", () => {
        const newTitle = prompt("Edit Title:", post.title) || post.title;
        const newExcerpt = prompt("Edit Excerpt:", post.excerpt) || post.excerpt;
        const newContent = prompt("Edit Content:", post.content) || post.content;
        const newCategory = prompt("Edit Category:", post.category) || post.category;

        update(ref(db, "pendingPosts/" + id), {
          title: newTitle,
          excerpt: newExcerpt,
          content: newContent,
          category: newCategory,
          lastEdited: Date.now()
        }).then(() => {
          alert("✏ Post updated successfully!");
        }).catch(err => {
          console.error("❌ Error updating post:", err);
          alert("❌ Failed to update post");
        });
      });

      // Approve Post
      div.querySelector(".approve").addEventListener("click", async () => {
        try {
          const newRef = push(ref(db, "posts"));
          await set(newRef, { ...post, status: "approved" });
          await remove(ref(db, "pendingPosts/" + id));
          alert("✅ Post approved");
        } catch (err) {
          console.error("❌ Error approving post:", err);
          alert("❌ Failed to approve post");
        }
      });

      // Reject Post
      div.querySelector(".reject").addEventListener("click", async () => {
        try {
          await remove(ref(db, "pendingPosts/" + id));
          alert("❌ Post rejected");
        } catch (err) {
          console.error("❌ Error rejecting post:", err);
          alert("❌ Failed to reject post");
        }
      });
    });
  });
}

// --- Load Notifications ---
function loadNotifications() {
  const notifContainer = document.getElementById("notificationsContainer");
  const notifRef = ref(db, "notifications");

  onValue(notifRef, (snapshot) => {
    notifContainer.innerHTML = "";
    if (!snapshot.exists()) {
      notifContainer.innerHTML = "<p class='text-gray-500'>No notifications.</p>";
      return;
    }

    const data = snapshot.val();
    Object.entries(data).forEach(([id, notif]) => {
      const div = document.createElement("div");
      div.className = "bg-white p-4 rounded shadow border-l-4 border-green-500";
      div.innerHTML = `
        <h3 class="font-semibold text-green-700">${notif.title}</h3>
        <p>${notif.message}</p>
        ${notif.link ? `<a href="${notif.link}" target="_blank" class="text-blue-600">Open Link</a>` : ""}
        <p class="text-sm text-gray-500">${notif.date}</p>
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

    if (!title || !message) {
      alert("⚠ Please fill in all fields.");
      return;
    }

    const newNotifRef = push(ref(db, "notifications"));
    await set(newNotifRef, {
      title,
      message,
      date: new Date().toLocaleDateString("en-GB"), // e.g., 12.12.2024
      timestamp: Date.now()
    });

    notifForm.reset();
    alert("📢 Notification sent!");
  });
}