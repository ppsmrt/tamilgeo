// ===================== FIREBASE INIT =====================
const firebaseConfig = {
  apiKey: "AIzaSyDt86oFFa-h04TsfMWSFGe3UHw26WYoR-U",
  authDomain: "tamilgeoapp.firebaseapp.com",
  databaseURL: "https://tamilgeoapp-default-rtdb.firebaseio.com",
  projectId: "tamilgeoapp",
  storageBucket: "tamilgeoapp.appspot.com",
  messagingSenderId: "1092623024431",
  appId: "1:1092623024431:web:ea455dd68a9fcf480be1da"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
const auth = firebase.auth();

// ===================== HELPER FUNCTIONS =====================
function showMessage(form, msg, type = 'error') {
  let msgEl = form.querySelector('.form-msg');
  if (!msgEl) {
    msgEl = document.createElement('div');
    msgEl.className = 'form-msg text-sm text-red-500 mt-2';
    form.appendChild(msgEl);
  }
  msgEl.textContent = msg;
  msgEl.className = `form-msg text-sm mt-2 ${type === 'success' ? 'text-green-500' : 'text-red-500'}`;
}

function setLoading(button, loading) {
  if (!button) return;
  if (loading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.textContent = 'Please wait...';
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || 'Submit';
  }
}

// ===================== AUTH MODULE =====================
const Auth = {
  // Signup with username check
  async signUp(form) {
    const signupBtn = form.querySelector('button[type="submit"]');
    setLoading(signupBtn, true);

    const fullname = form.fullname.value.trim();
    const email = form.email.value.trim();
    const username = form.username.value.trim();
    const password = form.password.value;

    if (!fullname || !email || !username || !password) {
      showMessage(form, 'All fields are required!');
      setLoading(signupBtn, false);
      return;
    }

    const snapshot = await db.ref('users').orderByChild('username').equalTo(username).once('value');
    if (snapshot.exists()) {
      showMessage(form, 'Username already taken!');
      setLoading(signupBtn, false);
      return;
    }

    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;
      const userData = {
        fullname,
        email,
        username,
        role: 'user',
        profilePicture: '',
        bio: '',
        UID: uid,
        createdAt: Date.now()
      };
      await db.ref('users/' + uid).set(userData);
      showMessage(form, 'Signup successful!', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 1000);
    } catch (err) {
      showMessage(form, err.message);
      setLoading(signupBtn, false);
    }
  },

  // Login with username
  async login(form) {
    const loginBtn = form.querySelector('button[type="submit"]');
    setLoading(loginBtn, true);

    const username = form.username.value.trim();
    const password = form.password.value;

    if (!username || !password) {
      showMessage(form, 'Both fields are required!');
      setLoading(loginBtn, false);
      return;
    }

    const snapshot = await db.ref('users').orderByChild('username').equalTo(username).once('value');
    if (!snapshot.exists()) {
      showMessage(form, 'Username not found! Reset password?');
      setLoading(loginBtn, false);
      return;
    }

    const userData = Object.values(snapshot.val())[0];
    try {
      await auth.signInWithEmailAndPassword(userData.email, password);
      if (userData.role === 'admin') {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'dashboard.html';
      }
    } catch (err) {
      showMessage(form, 'Incorrect password. Reset password?');
      setLoading(loginBtn, false);
    }
  },

  // Logout
  async logout() {
    await auth.signOut();
    window.location.href = 'login.html';
  },

  // Reset password
  async resetPassword(email) {
    try {
      await auth.sendPasswordResetEmail(email);
      alert('Password reset email sent!');
    } catch (err) {
      alert(err.message);
    }
  },

  // Track auth state
  onAuthStateChanged(callback) {
    auth.onAuthStateChanged(callback);
  }
};

// Expose globally
window.Auth = Auth;