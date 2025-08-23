import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, get, set, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDt86oFFa-h04TsfMWSFGe3UHw26WYoR-U",
  authDomain: "tamilgeoapp.firebaseapp.com",
  databaseURL: "https://tamilgeoapp-default-rtdb.firebaseio.com",
  projectId: "tamilgeoapp",
  storageBucket: "tamilgeoapp.firebasestorage.app",
  messagingSenderId: "1092623024431",
  appId: "1:1092623024431:web:ea455dd68a9fcf480be1da",
  measurementId: "G-2D45G35PM2"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

// ✅ DOM Elements
const profilePic = document.getElementById("profile-pic");
const changePicBtn = document.getElementById("change-pic-btn");
const form = document.getElementById("edit-profile-form");

// Fields
const firstName = document.getElementById("first-name");
const lastName = document.getElementById("last-name");
const username = document.getElementById("username");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const birth = document.getElementById("birth");
const gender = document.getElementById("gender");

// ✅ Load user data
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uid = user.uid;
    const userRef = ref(db, "users/" + uid);

    try {
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const data = snapshot.val();

        // Prefill form
        firstName.value = data.firstName || "";
        lastName.value = data.lastName || "";
        username.value = data.username || "";
        email.value = data.email || user.email; // fallback to auth email
        phone.value = data.phone || "";
        birth.value = data.birth || "";
        gender.value = data.gender || "Other";
        profilePic.src = data.profilePic || "https://via.placeholder.com/100";
      }
    } catch (error) {
      console.error("❌ Error loading user data:", error);
    }
  } else {
    console.log("⚠️ No user signed in");
    window.location.href = "/login.html"; // redirect if not logged in
  }
});

// ✅ Save updates
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return alert("Please log in first.");

  const uid = user.uid;
  const userRef = ref(db, "users/" + uid);

  const userData = {
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    username: username.value.trim(),
    email: email.value.trim(),
    phone: phone.value.trim(),
    birth: birth.value,
    gender: gender.value,
    profilePic: profilePic.src
  };

  try {
    await update(userRef, userData);
    alert("✅ Profile updated successfully!");
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    alert("Error saving profile. Try again.");
  }
});

// ✅ Change profile picture
changePicBtn.addEventListener("click", () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";

  fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        profilePic.src = e.target.result; // preview image
      };
      reader.readAsDataURL(file);
    }
  };

  fileInput.click();
});