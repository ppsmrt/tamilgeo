import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  get
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const placeholder = document.getElementById("shared-header");
const currentPath = window.location.pathname;
const isHomePage = currentPath.endsWith("index.html") || currentPath === "/" || currentPath === "/test/";

async function getUserRole(uid) {
  try {
    const userRef = ref(db, `users/${uid}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val().role || "user";
    }
  } catch (err) {
    console.error("Error fetching user role:", err);
  }
  return "user";
}

onAuthStateChanged(auth, async (user) => {
  let navContent = "";

  if (user) {
    const role = await getUserRole(user.uid);
    const accountPage = (role === "admin" || role === "manager") ? "dashboard.html" : "account.html";

    navContent = `
      <nav class="flex gap-2 text-sm font-medium">
        ${!isHomePage ? `
          <a href="index.html" class="px-4 py-1 rounded-full bg-green-600 text-white hover:bg-green-700 transition">
            Home
          </a>` : ""}
        <a href="${accountPage}" class="px-4 py-1 rounded-full border border-green-600 text-green-600 bg-white hover:bg-green-50 transition">
          Account
        </a>
        <button id="logout-btn" class="px-4 py-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition">
          Sign out
        </button>
      </nav>
    `;
  } else {
    navContent = `
      <nav class="flex gap-2 text-sm font-medium">
        ${!isHomePage ? `
          <a href="index.html" class="px-4 py-1 rounded-full bg-green-600 text-white hover:bg-green-700 transition">
            Home
          </a>` : ""}
        <a href="login.html" class="px-4 py-1 rounded-full border border-gray-400 text-gray-700 hover:bg-gray-100 transition">
          Login
        </a>
        <a href="signup.html" class="px-4 py-1 rounded-full border border-gray-400 text-gray-700 hover:bg-gray-100 transition">
          Sign Up
        </a>
      </nav>
    `;
  }

  const headerHTML = `
    <header class="flex justify-between items-center bg-white shadow px-4 py-3 sticky top-0 z-50">
      <a href="index.html" class="text-xl sm:text-2xl font-bold text-green-600">TamilGeo</a>
      ${navContent}
    </header>
  `;

  if (placeholder) {
    placeholder.innerHTML = headerHTML;

    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        signOut(auth)
          .then(() => {
            window.location.href = "index.html";
          })
          .catch(err => console.error("Sign out error:", err));
      });
    }
  } else {
    console.warn("⚠️ shared-header element not found in DOM");
  }
}, err => {
  console.error("🔥 Firebase auth error:", err);
});
