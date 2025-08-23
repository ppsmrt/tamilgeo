import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, updatePassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDt86oFFa-h04TsfMWSFGe3UHw26WYoR-U",
  authDomain: "tamilgeoapp.firebaseapp.com",
  databaseURL: "https://tamilgeoapp-default-rtdb.firebaseio.com",
  projectId: "tamilgeoapp",
  storageBucket: "tamilgeoapp.appspot.com",
  messagingSenderId: "1092623024431",
  appId: "1:1092623024431:web:ea455dd68a9fcf480be1da"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Toast helper
function showToast(message, type="info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.className = "fixed top-5 right-5 space-y-2 z-50";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `px-4 py-2 rounded-lg shadow-md max-w-xs text-white transition-all duration-300 ${
    type==="error"?"bg-red-500":type==="success"?"bg-green-500":"bg-gray-700"
  }`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(()=>{toast.classList.add("opacity-0","translate-x-2"); setTimeout(()=>toast.remove(),500);},3000);
}

// Step 1: Verify username + email
const verifyForm = document.getElementById("verify-form");
const resetForm = document.getElementById("reset-form");
let verifiedEmail = "", verifiedUsername = "";

verifyForm.addEventListener("submit", async e=>{
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  if(!username || !email) return showToast("Fill both username and email!", "error");

  try{
    const snapshot = await get(child(ref(db), `users/${username}`));
    if(!snapshot.exists()) return showToast("Username not found!", "error");

    const userData = snapshot.val();
    if(userData.email !== email) return showToast("Email does not match!", "error");

    verifiedEmail = email;
    verifiedUsername = username;

    showToast("✅ Verified! Enter your new password.", "success");
    verifyForm.classList.add("hidden");
    resetForm.classList.remove("hidden");

  }catch(err){
    console.error(err);
    showToast("Error verifying user.", "error");
  }
});

// Step 2: Reset password
resetForm.addEventListener("submit", async e=>{
  e.preventDefault();
  const newPassword = document.getElementById("new-password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();

  if(!newPassword || !confirmPassword) return showToast("Fill all password fields!", "error");
  if(newPassword !== confirmPassword) return showToast("Passwords do not match!", "error");

  try{
    // For demo purposes only: signing in with email and updating password
    // In production, never store plain passwords!
    const snapshot = await get(child(ref(db), `users/${verifiedUsername}`));
    const oldPassword = snapshot.val().password || "Temp123"; // fallback password if not stored
    const userCredential = await signInWithEmailAndPassword(auth, verifiedEmail, oldPassword);

    await updatePassword(userCredential.user, newPassword);

    // Update password in database for demo
    await ref(db, `users/${verifiedUsername}/password`).set(newPassword);

    showToast("✅ Password reset successfully!", "success");
    setTimeout(()=>window.location.href="login.html",1500);

  }catch(err){
    console.error(err);
    showToast("Error resetting password.", "error");
  }
});

// Contact support
document.getElementById("retrieve-account-btn").addEventListener("click", ()=>{
  window.location.href = "mailto:tamilgeo.official@gmail.com";
});
