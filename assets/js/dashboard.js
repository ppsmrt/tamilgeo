// Dashboard.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDt86oFFa-h04TsfMWSFGe3UHw26WYoR-U",
  authDomain: "tamilgeoapp.firebaseapp.com",
  databaseURL: "https://tamilgeoapp-default-rtdb.firebaseio.com",
  projectId: "tamilgeoapp",
  storageBucket: "tamilgeoapp.appspot.com",
  messagingSenderId: "1092623024431",
  appId: "1:1092623024431:web:ea455dd68a9fcf480be1da"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// DOM Elements
const fullnameEl = document.getElementById("fullname");
const logoutLink = document.getElementById("logoutLink");

// Auth listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;
    const userRef = ref(db, "users/" + uid);

    // Get full name from Firebase
    onValue(userRef, (snapshot) => {
      const data = snapshot.val() || {};
      fullnameEl.textContent = data.name || "User";
    });

    // Logout logic
    logoutLink.addEventListener("click", async (e) => {
      e.preventDefault(); // prevent default anchor behavior
      try {
        await signOut(auth);
        window.location.href = "/tamilgeo/logout"; // redirect after logout
      } catch (error) {
        console.error("Logout failed:", error);
      }
    });

  } else {
    fullnameEl.textContent = "Guest";
  }
});