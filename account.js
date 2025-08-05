firebase.auth().onAuthStateChanged(user => {
  if (user) {
    document.getElementById('accountInfo').style.display = 'block';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('userEmail').textContent = user.email;
    document.getElementById('userName').textContent = user.displayName || 'User';
  }
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;
  firebase.auth().signInWithEmailAndPassword(email, pass).catch(console.error);
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('registerEmail').value;
  const pass = document.getElementById('registerPassword').value;
  firebase.auth().createUserWithEmailAndPassword(email, pass).catch(console.error);
});

function logoutUser() {
  firebase.auth().signOut();
}

function showRegister() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
}

function showLogin() {
  document.getElementById('registerForm').style.display = 'none';
  document.getElementById('loginForm').style.display = 'block';
}