import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

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
const storage = getStorage(app);

// ✅ DOM Elements
const profilePic = document.getElementById("profile-pic");
const editPicBtn = document.getElementById("edit-pic-btn");
const form = document.getElementById("edit-profile-form");

// Fields
const firstName = document.getElementById("first-name");
const lastName = document.getElementById("last-name");
const username = document.getElementById("username");
const email = document.getElementById("email");
const bio = document.getElementById("bio");
const locationEl = document.getElementById("location");
const roleEl = document.getElementById("role");

// ✅ Set non-editable fields
[username, email, locationEl, roleEl].forEach(el => el.setAttribute("readonly", true));

// ✅ Load user data
let selectedFile = null; // store the chosen profile picture file

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/login.html";
    return;
  }

  const uid = user.uid;
  const userRef = ref(db, "users/" + uid);

  try {
    const snapshot = await get(userRef);
    const data = snapshot.exists() ? snapshot.val() : {};

    // Editable fields
    firstName.value = data.firstName || "";
    lastName.value = data.lastName || "";
    bio.value = data.bio || "";

    // Non-editable fields
    username.value = data.username || "";
    email.value = data.email || user.email;
    locationEl.value = data.location || "";
    roleEl.value = data.role || "";

    // Profile picture
    profilePic.src = data.profilePic || "/tamilgeo/assets/icon/dp.png";

  } catch (error) {
    console.error("❌ Error loading user data:", error);
    alert("Failed to load profile. Try again.");
  }
});

// ✅ Change profile picture (select file)
editPicBtn.addEventListener("click", () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";

  fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (file) {
      selectedFile = file; // store file for upload
      const reader = new FileReader();
      reader.onload = (e) => {
        profilePic.src = e.target.result; // preview
      };
      reader.readAsDataURL(file);
    }
  };

  fileInput.click();
});

// ✅ Save updates including uploading profile picture
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return alert("Please log in first.");

  const uid = user.uid;
  const userRef = ref(db, "users/" + uid);
  let profilePicUrl = profilePic.src;

  try {
    // ✅ Upload profile picture to Firebase Storage if new file selected
    if (selectedFile) {
      const storagePath = `profilePictures/${uid}/${selectedFile.name}`;
      const storageReference = storageRef(storage, storagePath);
      await uploadBytes(storageReference, selectedFile);
      profilePicUrl = await getDownloadURL(storageReference);
    }

    // ✅ Update user data in Realtime Database
    const userData = {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      bio: bio.value.trim(),
      profilePic: profilePicUrl,
    };

    await update(userRef, userData);
    alert("✅ Profile updated successfully!");
    selectedFile = null; // reset file after upload

  } catch (error) {
    console.error("❌ Error updating profile:", error);
    alert("Error saving profile. Try again.");
  }
});