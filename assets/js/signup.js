import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { 
  getDatabase, 
  ref, 
  get, 
  set 
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

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// 🔹 DOM Elements
const signupForm = document.getElementById("signup-form");
let message = document.getElementById("message");
if (!message) {
  message = document.createElement("p");
  message.id = "message";
  message.className = "text-center mt-2 text-red-500";
  signupForm.appendChild(message);
}

// 🔹 Redirect Function
async function redirectUser(uid) {
  try {
    const snapshot = await get(ref(db, `users/${uid}/role`));
    if (snapshot.exists()) {
      const role = snapshot.val();
      console.log("User role:", role);

      if (role === "admin") {
        window.location.replace("/tamilgeo/admin.html");
      } else {
        window.location.replace("/tamilgeo/dashboard.html");
      }
    } else {
      message.textContent = "❌ Role not found!";
    }
  } catch (error) {
    console.error("Error fetching role:", error);
    message.textContent = "❌ Could not fetch role!";
  }
}

// 🔹 Signup Submit
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    message.textContent = "Creating account...";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const username = document.getElementById("username").value.trim();

    try {
      // ✅ Create Firebase Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // ✅ Save user profile in Realtime DB using UID as key
      await set(ref(db, `users/${uid}`), {
        UID: uid,
        email: email,
        username: username,
        firstName: "",
        lastName: "",
        secondName: "",
        bio: "",
        profilePicture: "",
        location: "India",
        role: "user",
        createdAt: new Date().toISOString()
      });

      message.textContent = "✅ Account created! Redirecting...";
      signupForm.reset();

      // ✅ Redirect based on role
      redirectUser(uid);

    } catch (error) {
      console.error("Signup error:", error);
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