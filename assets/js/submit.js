import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

const postForm = document.getElementById("postForm");
const authorInput = document.getElementById("author");

// ✅ Initialize Quill
var quill = new Quill('#editor-container', {
  theme: 'snow',
  modules: {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      [{ 'font': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'blockquote', 'code-block']
    ]
  }
});

// ✅ Ensure only logged-in users
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/tamilgeo/login.html";
    return;
  }
  authorInput.value = user.displayName || user.email;
});

// ✅ Form Submission
postForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    alert("⚠ You must be logged in to submit a post.");
    return;
  }

  const title = document.getElementById("title").value.trim();
  const category = document.getElementById("category").value.trim();
  const tags = document.getElementById("tags").value.trim();
  const excerpt = document.getElementById("excerpt").value.trim();
  const contentText = quill.getText().trim();
  const contentHTML = quill.root.innerHTML.trim();
  const image = document.getElementById("image").value.trim();
  const acceptRules = document.getElementById("acceptRules").checked;

  if (!title || !category || !excerpt || !contentText) {
    alert("⚠ Please fill in all required fields and post content.");
    return;
  }

  if (!acceptRules) {
    alert("⚠ You must agree to the rules before submitting.");
    return;
  }

  const postId = push(ref(db, "pendingPosts")).key;

  const postData = {
    title,
    category,
    tags: tags ? tags.split(",").map(t => t.trim()) : [],
    excerpt,
    content: contentHTML,
    image: image || null,
    authorId: user.uid,
    authorName: user.displayName || user.email,
    date: Date.now(),
    status: "pending"
  };

  try {
    await set(ref(db, "pendingPosts/" + postId), postData);
    alert("✅ Post submitted for approval!");
    postForm.reset();
    quill.setContents([]);
    authorInput.value = user.displayName || user.email;
  } catch (err) {
    console.error(err);
    alert("❌ Error submitting post. Please try again.");
  }
});