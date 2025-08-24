// ===============================
// ✅ Firebase Configuration
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyDt86oFFa-h04TsfMWSFGe3UHw26WYoR-U",
  authDomain: "tamilgeoapp.firebaseapp.com",
  databaseURL: "https://tamilgeoapp-default-rtdb.firebaseio.com", // ✅ Required for Realtime DB
  projectId: "tamilgeoapp",
  storageBucket: "tamilgeoapp.appspot.com",
  messagingSenderId: "1092623024431",
  appId: "1:1092623024431:web:ea455dd68a9fcf480be1da"
};

// ✅ Initialize Firebase (only once)
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// ===============================
// ✅ Auth State Check
// ===============================
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    // Redirect if not logged in
    window.location.href = "/tamilgeo/login.html";
    return;
  }

  // ✅ Fetch user profile from Firebase Realtime Database
  firebase.database().ref("users/" + user.uid).on("value", snapshot => {
    const profile = snapshot.val();

    if (profile) {
      // ✅ Full Name (fallback if missing)
      document.getElementById("profileName").textContent =
        profile.fullname || "No Name";

      // ✅ Email (fallback to auth email)
      document.getElementById("profileEmail").textContent =
        profile.email || user.email;

      // ✅ Profile Picture (default if missing or empty)
      const profilePic = document.getElementById("profilePic");
      profilePic.src =
        profile.profilePicture && profile.profilePicture.trim() !== ""
          ? profile.profilePicture
          : "https://ppsmrt.github.io/tamilgeo/assets/icon/dp.png";

      // ✅ Fallback if broken link
      profilePic.onerror = () => {
        profilePic.src = "https://ppsmrt.github.io/tamilgeo/assets/icon/dp.png";
      };
    }
  });
});

// ===============================
// ✅ DOMContentLoaded (Logout only)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");

  // ✅ Logout button
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async e => {
      e.preventDefault();
      try {
        await firebase.auth().signOut();
        window.location.href = "index.html"; // Redirect after logout
      } catch (error) {
        console.error("Logout Error:", error);
      }
    });
  }
});