// assets/js/notifications.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ✅ DOM
const listEl = document.getElementById("notificationsList");
const emptyState = document.getElementById("emptyState");
const loginMsg = document.getElementById("loginMsg");

// ✅ Category Icons + Colors
const categories = {
  General: { icon: "fa-clipboard", color: "bg-gray-400" },
  Entertainment: { icon: "fa-film", color: "bg-purple-500" },
  Political: { icon: "fa-landmark", color: "bg-red-500" },
  Nature: { icon: "fa-leaf", color: "bg-green-500" },
  Technology: { icon: "fa-microchip", color: "bg-blue-500" },
  Health: { icon: "fa-heart-pulse", color: "bg-pink-500" },
  Shopping: { icon: "fa-cart-shopping", color: "bg-yellow-500" }
};

// ✅ Check login state
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // User NOT logged in
    listEl.innerHTML = "";
    emptyState.classList.add("hidden");
    loginMsg.classList.remove("hidden");
    return;
  }

  // User is logged in
  loginMsg.classList.add("hidden");
  loadNotifications();
});

// ✅ Load Notifications for logged in users
function loadNotifications() {
  const notiRef = ref(db, "notifications");

  onValue(notiRef, (snapshot) => {
    if (!snapshot.exists()) {
      listEl.innerHTML = "";
      emptyState.classList.remove("hidden");
      return;
    }

    emptyState.classList.add("hidden");
    const data = snapshot.val();
    const items = Object.entries(data).reverse();

    listEl.innerHTML = items.map(([id, noti]) => {
      const cat = categories[noti.category] || categories.General;

      return `
        <div class="flex items-center space-x-3 p-3 rounded-xl bg-white shadow hover:bg-gray-50 cursor-pointer"
             onclick="handleClick('${id}', '${noti.postLink || ""}')">
          <div class="p-3 rounded-full ${cat.color} text-white">
            <i class="fa-solid ${cat.icon}"></i>
          </div>
          <div class="flex-1">
            <p class="text-gray-800 font-medium truncate">${noti.title}</p>
            <span class="text-xs text-gray-500">${noti.category}</span>
          </div>
        </div>
      `;
    }).join("");
  });
}

// ✅ Handle Notification Click
window.handleClick = function(id, link) {
  const notiRef = ref(db, "notifications/" + id);

  if (link && link !== "") {
    window.open(link, "_blank");
  } else {
    onValue(notiRef, (snapshot) => {
      if (snapshot.exists()) {
        const noti = snapshot.val();
        document.getElementById("popupTitle").innerText = noti.title;
        document.getElementById("popupDesc").innerText = noti.description || "";
        const imgEl = document.getElementById("popupImg");
        if (noti.imageUrl) {
          imgEl.src = noti.imageUrl;
          imgEl.classList.remove("hidden");
        } else {
          imgEl.classList.add("hidden");
        }
        document.getElementById("popupModal").classList.remove("hidden");
      }
    }, { onlyOnce: true });
  }
};

// ✅ Close Popup
document.getElementById("closeModal").addEventListener("click", () => {
  document.getElementById("popupModal").classList.add("hidden");
});