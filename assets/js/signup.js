import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { 
  getDatabase, 
  ref, 
  get 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// 🔹 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDt86oFFa-h04TsfMWSFGe3UHw26WYoR-U",
  authDomain: "tamilgeoapp.firebaseapp.com",
  databaseURL: "https://tamilgeoapp-default-rtdb.firebaseio.com",
  projectId: "tamilgeoapp",
  storageBucket: "tamilgeoapp.appspot.com",
  messagingSenderId: "1092623024431",
  appId: "1:1092623024431:web:ea455dd68a9fcf480be1da"
};

// 🔹 Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Elements
const loginForm = document.getElementById("login-form");
let message = document.getElementById("message");
if (!message) {
  message = document.createElement("p");
  message.id = "message";
  message.className = "text-center mt-2 text-red-500";
  loginForm.appendChild(message);
}

// 🔹 Redirect Function
async function redirectUser(uid) {
  try {
    const snapshot = await get(ref(db, `users/${uid}/role`));
    if (snapshot.exists()) {
      const role = snapshot.val();
      console.log("User role:", role);

      if (role === "admin") {
        window.location.replace("admin.html");
      } else {
        window.location.replace("dashboard.html");
      }
    } else {
      message.textContent = "❌ Role not found!";
    }
  } catch (error) {
    console.error("Error fetching role:", error);
    message.textContent = "❌ Could not fetch role!";
  }
}

// 🔹 Login Submit
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "Logging in...";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      message.textContent = "✅ Logged in! Redirecting...";
      loginForm.reset();

      redirectUser(userCredential.user.uid);
    } catch (error) {
      console.error(error);
      message.textContent = `❌ ${error.message}`;
    }
  });
}

// 🔹 Auto-redirect if already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User already logged in:", user.uid);
    redirectUser(user.uid);
  }
});