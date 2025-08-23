import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, verifyPasswordResetCode, confirmPasswordReset } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDt86oFFa-h04TsfMWSFGe3UHw26WYoR-U",
  authDomain: "tamilgeoapp.firebaseapp.com",
  projectId: "tamilgeoapp",
  storageBucket: "tamilgeoapp.appspot.com",
  messagingSenderId: "1092623024431",
  appId: "1:1092623024431:web:ea455dd68a9fcf480be1da"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const params = new URLSearchParams(window.location.search);
const oobCode = params.get("oobCode");

document.getElementById("reset-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const newPassword = document.getElementById("new-password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();

  if (newPassword !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    // Verify the reset code
    await verifyPasswordResetCode(auth, oobCode);

    // Confirm the password reset
    await confirmPasswordReset(auth, oobCode, newPassword);

    alert("✅ Password has been reset successfully!");
    window.location.href = "login.html";
  } catch (err) {
    console.error(err);
    alert("Error resetting password: " + err.message);
  }
});