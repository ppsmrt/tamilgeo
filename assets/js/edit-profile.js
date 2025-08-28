// ✅ Import Firebase SDK Modules
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
  storageBucket: "tamilgeoapp.appspot.com",
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
const saveBtn = form.querySelector("button[type='submit']");

// Editable fields
const firstName = document.getElementById("first-name");
const lastName = document.getElementById("last-name");
const bio = document.getElementById("bio");

// Non-editable fields
const username = document.getElementById("username");
const email = document.getElementById("email");
const locationEl = document.getElementById("location");
const roleEl = document.getElementById("role");

// Make non-editable fields readonly
[username, email, locationEl, roleEl].forEach(el => el.setAttribute("readonly", true));

let selectedFile = null; // For storing new profile picture file

// ✅ Load user data from Realtime Database
async function loadUserData(uid, fallbackEmail = "") {
  const userRef = ref(db, "users/" + uid);

  try {
    const snapshot = await get(userRef);
    const data = snapshot.exists() ? snapshot.val() : {};

    console.log("🔄 Loaded user data:", data);

    // Fill editable fields
    firstName.value = data.firstName || "";
    lastName.value = data.lastName || "";
    bio.value = data.bio || "";

    // ✅ Updated: Fill non-editable fields from DB
    username.value = data.username || "Not Set";
    email.value = data.email || fallbackEmail;
    locationEl.value = data.location || "Not Provided";  // ✅ Show DB location
    roleEl.value = data.role || "User";  // ✅ Show role from DB

    // Profile picture
    profilePic.src = data.profilePicture || "/tamilgeo/assets/icon/dp.png";

  } catch (error) {
    console.error("❌ Error loading user data:", error);
    alert("Failed to load profile. Try again.");
  }
}

// ✅ Monitor auth state and load user data
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "/tamilgeo/login.html";
    return;
  }
  await loadUserData(user.uid, user.email);
});

// ✅ Change profile picture
editPicBtn.addEventListener("click", () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/*";

  fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (file) {
      selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        profilePic.src = e.target.result; // Show preview
      };
      reader.readAsDataURL(file);
    }
  };

  fileInput.click();
});

// ✅ Show spinner during save
function setSavingState(isSaving) {
  if (isSaving) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = `
      <svg class="animate-spin h-5 w-5 text-white inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
      </svg>
      Saving...
    `;
  } else {
    saveBtn.disabled = false;
    saveBtn.innerHTML = `Save Changes`;
  }
}

// ✅ Save updated profile
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return alert("Please log in first.");

  const uid = user.uid;
  const userRef = ref(db, "users/" + uid);
  let profilePicUrl = profilePic.src;

  try {
    setSavingState(true);

    // Upload new profile picture if selected
    if (selectedFile) {
      const storagePath = `profilePictures/${uid}/${selectedFile.name}`;
      const storageReference = storageRef(storage, storagePath);
      await uploadBytes(storageReference, selectedFile);
      profilePicUrl = await getDownloadURL(storageReference);
    }

    // Prepare updated data (editable fields only)
    const userData = {
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      bio: bio.value.trim(),
      profilePicture: profilePicUrl
    };

    await update(userRef, userData);
    alert("✅ Profile updated successfully!");
    selectedFile = null;

    // Reload fresh data
    await loadUserData(uid, user.email);

  } catch (error) {
    console.error("❌ Error updating profile:", error);
    alert("Error saving profile. Try again.");
  } finally {
    setSavingState(false);
  }
});
