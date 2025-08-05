// submit.js
document.getElementById("submitForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();

  if (!title || !content) return;

  // Firebase Firestore logic can be inserted here

  document.getElementById("submitMsg").innerText = "Post submitted for review.";
});
