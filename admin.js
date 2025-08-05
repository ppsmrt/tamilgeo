// account.js
document.addEventListener("DOMContentLoaded", () => {
  const userEmail = localStorage.getItem("userEmail");
  document.getElementById("emailDisplay").innerText = userEmail || "Not logged in";
});

function logout() {
  localStorage.removeItem("userEmail");
  alert("Logged out");
  window.location.href = "index.html";
}


