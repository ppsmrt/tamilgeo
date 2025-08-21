import { auth, db, doc, getDoc, updateDoc, onAuthStateChanged } from "./auth.js";

// Prefill form when user is logged in
onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = "/login.html";

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    const data = snap.data();
    document.getElementById("first-name").value = data.firstName || "";
    document.getElementById("last-name").value = data.lastName || "";
    document.getElementById("username").value = data.username || "";
    document.getElementById("email").value = user.email || "";
    document.getElementById("phone").value = data.phone || "";
    document.getElementById("birth").value = data.birth || "";
    document.getElementById("gender").value = data.gender || "Other";
    document.getElementById("profile-pic").src = data.photoURL || "https://via.placeholder.com/100";
  }
});

// Save changes
document.getElementById("edit-profile-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) return alert("Not logged in");

  const userRef = doc(db, "users", user.uid);

  await updateDoc(userRef, {
    firstName: document.getElementById("first-name").value,
    lastName: document.getElementById("last-name").value,
    username: document.getElementById("username").value,
    phone: document.getElementById("phone").value,
    birth: document.getElementById("birth").value,
    gender: document.getElementById("gender").value,
    photoURL: document.getElementById("profile-pic").src
  });

  alert("✅ Profile updated!");
});

// Change password
document.getElementById("change-password-btn").addEventListener("click", async () => {
  const email = auth.currentUser?.email;
  if (!email) return;
  await auth.sendPasswordResetEmail(email);
  alert("Password reset email sent!");
});