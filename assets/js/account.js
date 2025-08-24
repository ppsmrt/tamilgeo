import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import { getStorage, ref as storageRef, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ✅ Firebase instances
const Auth = getAuth();
const db = getDatabase();
const storage = getStorage();

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
          // If profilePicture is a path in Storage, get download URL
          const url = await getDownloadURL(storageRef(storage, profile.profilePicture));
          profilePicEl.src = url;
        } catch (err) {
          console.warn("Failed to load profile picture from Storage, using default:", err);
          profilePicEl.src = "https://ppsmrt.github.io/tamilgeo/assets/icon/dp.png";
        }
      } else {
        // Default picture
        profilePicEl.src = "https://ppsmrt.github.io/tamilgeo/assets/icon/dp.png";
      }
    }
  });
});

// ✅ Logout button
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await signOut(Auth);
        window.location.href = "/tamilgeo/index.html";
      } catch (error) {
        console.error("Logout Error:", error);
        alert("Failed to logout. Please try again.");
      }
    });
  }
});