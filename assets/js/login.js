import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

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

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

function setMsg(el, txt) {
  if (!el) return;
  el.textContent = txt;
}

async function getUserRole(uid) {
  const snap = await get(ref(db, `users/${uid}/role`));
  return snap.exists() ? snap.val() : null;
}

function go(where) {
  // Use replace() to avoid back button coming back to login
  window.location.replace(where);
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (!form) return;

  let message = document.getElementById("message");
  if (!message) {
    message = document.createElement("p");
    message.id = "message";
    message.className = "text-center mt-2 text-red-500";
    form.appendChild(message);
  }

  const submitBtn = form.querySelector('button[type="submit"]');

  async function redirectAfterLogin(uid) {
    try {
      const role = await getUserRole(uid);
      if (role === "admin") go("admin.html");
      else if (role === "user" || role == null) go("dashboard.html"); // default to user dashboard
      else go("dashboard.html");
    } catch (err) {
      console.error("Role fetch failed:", err);
      setMsg(message, "❌ Could not verify role. Redirecting to dashboard…");
      go("dashboard.html");
    }
  }

  // Already logged in? Redirect.
  onAuthStateChanged(auth, (user) => {
    if (user) redirectAfterLogin(user.uid);
  });

  // Handle submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // prevent page refresh
    setMsg(message, "Logging in…");
    if (submitBtn) { submitBtn.disabled = true; submitBtn.classList.add("opacity-60"); }

    const email = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value;

    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setMsg(message, "✅ Logged in! Redirecting…");
      await redirectAfterLogin(cred.user.uid);
    } catch (err) {
      console.error(err);
      setMsg(message, `❌ ${err.message}`);
    } finally {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.classList.remove("opacity-60"); }
    }
  });
});