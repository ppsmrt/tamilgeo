import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, push, set, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

// ✅ Create Notification Form Dynamically
const container = document.getElementById("notificationContainer");

const formWrapper = document.createElement("div");
formWrapper.className = "max-w-md mx-auto p-4 bg-white shadow rounded";

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
container.appendChild(formWrapper);

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
