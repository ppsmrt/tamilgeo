import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { 
  getDatabase, 
  ref, 
  get, 
  set 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { 
  getStorage, 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

// 🔹 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDt86oFFa-h04TsfMWSFGe3UHw26WYoR-U",
  authDomain: "tamilgeoapp.firebaseapp.com",
  databaseURL: "https://tamilgeoapp-default-rtdb.firebaseio.com",
  projectId: "tamilgeoapp",
  storageBucket: "tamilgeoapp.appspot.com",
  messagingSenderId: "1092623024431",
  appId: "1:1092623024431:web:ea455dd68a9fcf480be1da"
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// 🔹 DOM Elements
const signupForm = document.getElementById("signup-form");

// Toast container
let toastContainer = document.getElementById("toast-container");
if (!toastContainer) {
  toastContainer = document.createElement("div");
  toastContainer.id = "toast-container";
  toastContainer.className = "fixed top-4 right-4 space-y-2 z-50";
  document.body.appendChild(toastContainer);
}

// 🔹 Toast function
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `px-4 py-2 rounded shadow text-white ${type === "success" ? "bg-green-500" : "bg-red-500"}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

// 🔹 Redirect Function
async function redirectUser(uid) {
  try {
    const snapshot = await get(ref(db, `users/${uid}/role`));
    if (snapshot.exists()) {
      const role = snapshot.val();
      if (role === "admin") {
        window.location.replace("/tamilgeo/admin.html");
      } else {
        window.location.replace("/tamilgeo/dashboard.html");
      }
    } else {
      showToast("Role not found!", "error");
    }
  } catch (error) {
    console.error("Error fetching role:", error);
    showToast("Could not fetch role!", "error");
  }
}

// 🔹 Signup Submit
if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const bio = document.getElementById("bio").value.trim();
    const location = document.getElementById("location").value.trim() || "India";
    const profilePicFile = document.getElementById("profilePicture").files[0];

    // ✅ Username restrictions
    if (!username || username.toLowerCase() === "admin" || username.toLowerCase() === "owner") {
      showToast("Admin/owner username not allowed!", "error");
      return;
    }

    try {
      // Check if username already exists
      const usernameSnapshot = await get(ref(db, "users"));
      if (usernameSnapshot.exists()) {
        const users = usernameSnapshot.val();
        for (const uid in users) {
          if (users[uid].username.toLowerCase() === username.toLowerCase()) {
            showToast("Username already exists!", "error");
            return;
          }
        }
      }

      showToast("Creating account...");

      // ✅ Create Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, document.getElementById("password").value);
      const uid = userCredential.user.uid;

      // ✅ Upload profile picture if provided
      let profilePictureURL = "";
      if (profilePicFile) {
        const picRef = storageRef(storage, `profilePictures/${uid}_${profilePicFile.name}`);
        await uploadBytes(picRef, profilePicFile);
        profilePictureURL = await getDownloadURL(picRef);
      }

      // ✅ Save user profile in Realtime DB
      await set(ref(db, `users/${uid}`), {
        UID: uid,
        email,
        username,
        firstName,
        lastName,
        bio,
        location,
        profilePicture: profilePictureURL,
        role: "user",
        createdAt: new Date().toISOString()
      });

      signupForm.reset();
      showToast("Account created successfully! Redirecting...", "success");
      redirectUser(uid);

    } catch (error) {
      console.error("Signup error:", error);
      showToast(error.message, "error");
    }
  });
}

// 🔹 Auto-redirect if already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    redirectUser(user.uid);
  }
});