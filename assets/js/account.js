import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getStorage, ref as storageRef, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDt86oFFa-h04TsfMWSFGe3UHw26WYoR-U",
  authDomain: "tamilgeoapp.firebaseapp.com",
  databaseURL: "https://tamilgeoapp-default-rtdb.firebaseio.com",
  projectId: "tamilgeoapp",
  storageBucket: "tamilgeoapp.appspot.com",
  messagingSenderId: "1092623024431",
  appId: "1:1092623024431:web:ea455dd68a9fcf480be1da"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const Auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// ✅ Check auth state
onAuthStateChanged(Auth, async (user) => {
  if (!user) {
    window.location.href = "/login.html";
    return;
  }

  const profilePicEl = document.getElementById("profilePic");
  const profileNameEl = document.getElementById("profileName");
  const profileEmailEl = document.getElementById("profileEmail");

  // Fetch profile from Realtime Database
  onValue(ref(db, "users/" + user.uid), async (snapshot) => {
    const profile = snapshot.val();

    // ✅ Full name
    if (profileNameEl) profileNameEl.textContent = profile?.fullname || "No Name";

    // ✅ Email
    if (profileEmailEl) profileEmailEl.textContent = profile?.email || user.email;

    // ✅ Profile Picture
    if (profilePicEl) {
      if (profile?.profilePicture) {
        try {
          const url = await getDownloadURL(storageRef(storage, profile.profilePicture));
          profilePicEl.src = url;
        } catch (err) {
          console.warn("Failed to load profile picture from Storage, using default:", err);
          profilePicEl.src = "https://ppsmrt.github.io/tamilgeo/assets/icon/dp.png";
        }
      } else {
        profilePicEl.src = "https://ppsmrt.github.io/tamilgeo/assets/icon/dp.png";
      }
    }
  });
});

// ✅ Logout button (fixed version from v9 style)
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      signOut(Auth)
        .then(() => {
          window.location.href = "/tamilgeo/index.html";
        })
        .catch((error) => {
          console.error("Logout error:", error);
          alert("Failed to logout. Please try again.");
        });
    });
  }
});