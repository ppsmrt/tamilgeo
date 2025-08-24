// ✅ Check auth state
Auth.onAuthStateChanged(user => {
  if (!user) {
    // Redirect if not logged in
    window.location.href = "/login.html";
    return;
  }

  // ✅ Fetch user profile from Firebase Realtime Database
  db.ref("users/" + user.uid).on("value", snapshot => {
    const profile = snapshot.val();
    if (profile) {
      document.getElementById("profileName").textContent = profile.fullname || "No Name";
      document.getElementById("profileEmail").textContent = profile.email || user.email;
      document.getElementById("profilePic").src = profile.profilePicture || "https://via.placeholder.com/100";
    }
  });
});

// ✅ Logout button (redirect to index.html after logout)
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutBtn");
  const editProfileBtn = document.getElementById("editProfileBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        // ✅ Use Firebase Auth signOut instead of Auth.logout()
        await Auth.signOut();
        window.location.href = "/tamilgeo/index.html"; // Redirect after logout
      } catch (error) {
        console.error("Logout Error:", error);
      }
    });
  }
