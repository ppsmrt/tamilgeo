import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, push, set, get, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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
const auth = getAuth(app);
const db = getDatabase(app);

// ✅ Main container
const container = document.getElementById("notificationContainer");

// ✅ Form Section
const formWrapper = document.createElement("div");
formWrapper.className = "max-w-md mx-auto p-4 bg-white shadow rounded mb-6";

const titleInput = document.createElement("input");
titleInput.type = "text";
titleInput.placeholder = "Notification Title";
titleInput.className = "border border-gray-300 rounded p-2 w-full mb-2";

const messageInput = document.createElement("textarea");
messageInput.placeholder = "Notification Message";
messageInput.className = "border border-gray-300 rounded p-2 w-full mb-2";

const sendBtn = document.createElement("button");
sendBtn.textContent = "Send Notification";
sendBtn.className = "bg-blue-500 text-white p-2 w-full rounded hover:bg-blue-600";

formWrapper.appendChild(titleInput);
formWrapper.appendChild(messageInput);
formWrapper.appendChild(sendBtn);

// ✅ Notification List Section
const listWrapper = document.createElement("div");
listWrapper.className = "max-w-lg mx-auto p-4 bg-white shadow rounded";

const listTitle = document.createElement("h3");
listTitle.textContent = "Manage Notifications";
listTitle.className = "text-lg font-bold mb-4";

const notifList = document.createElement("div");
notifList.id = "notifList";
notifList.className = "space-y-4";

listWrapper.appendChild(listTitle);
listWrapper.appendChild(notifList);

container.appendChild(formWrapper);
container.appendChild(listWrapper);

// ✅ Send Notification Logic
sendBtn.addEventListener("click", async () => {
  const title = titleInput.value.trim();
  const message = messageInput.value.trim();

  if (!title || !message) {
    alert("Please fill in both fields!");
    return;
  }

  const newNotification = {
    title: title,
    message: message,
    timestamp: Date.now()
  };

  try {
    // Save notification globally
    const notifRef = ref(db, "notifications");
    const newNotifRef = push(notifRef);
    await set(newNotifRef, newNotification);

    // Assign notification to all users
    const usersRef = ref(db, "users");
    const usersSnap = await get(usersRef);
    if (usersSnap.exists()) {
      usersSnap.forEach(user => {
        const userId = user.key;
        const userNotifRef = ref(db, `userNotifications/${userId}/${newNotifRef.key}`);
        set(userNotifRef, true);
      });
    }

    alert("Notification sent successfully!");
    titleInput.value = "";
    messageInput.value = "";
  } catch (error) {
    console.error("Error sending notification:", error);
    alert("Failed to send notification!");
  }
});

// ✅ Load & Manage Notifications
const notificationsRef = ref(db, "notifications");

onValue(notificationsRef, (snapshot) => {
  notifList.innerHTML = ""; // Clear previous list

  if (snapshot.exists()) {
    const data = snapshot.val();
    const keys = Object.keys(data).reverse(); // Show latest first

    keys.forEach((id) => {
      const notif = data[id];

      const card = document.createElement("div");
      card.className = "border p-3 rounded shadow-sm flex justify-between items-start bg-gray-50";

      const contentDiv = document.createElement("div");
      contentDiv.innerHTML = `
        <h4 class="font-semibold">${notif.title}</h4>
        <p class="text-gray-700">${notif.message}</p>
        <small class="text-gray-500">${new Date(notif.timestamp).toLocaleString()}</small>
      `;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ml-4";
      deleteBtn.addEventListener("click", () => deleteNotification(id));

      card.appendChild(contentDiv);
      card.appendChild(deleteBtn);
      notifList.appendChild(card);
    });
  } else {
    notifList.innerHTML = "<p class='text-gray-500'>No notifications found.</p>";
  }
});

// ✅ Delete Notification
async function deleteNotification(notifId) {
  const confirmDelete = confirm("Are you sure you want to delete this notification?");
  if (!confirmDelete) return;

  try {
    // Remove from notifications node
    await remove(ref(db, `notifications/${notifId}`));

    // Remove from all users under userNotifications
    const usersRef = ref(db, "userNotifications");
    const usersSnap = await get(usersRef);
    if (usersSnap.exists()) {
      usersSnap.forEach((user) => {
        const uid = user.key;
        const userNotifRef = ref(db, `userNotifications/${uid}/${notifId}`);
        remove(userNotifRef);
      });
    }

    alert("Notification deleted successfully!");
  } catch (error) {
    console.error("Error deleting notification:", error);
    alert("Failed to delete notification!");
  }
}