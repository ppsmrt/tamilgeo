import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue, set, increment, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Get post ID from URL
const postId = new URLSearchParams(window.location.search).get("id");
const container = document.getElementById("post-container");

if (!postId) {
  container.innerHTML = "<p class='text-red-500'>Invalid Post ID.</p>";
  throw new Error("Missing post ID");
}

// Fetch WordPress post
const postURL = `https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts/${postId}`;

fetch(postURL)
  .then(res => {
    if (!res.ok) throw new Error("Failed to fetch post");
    return res.json();
  })
  .then(post => {
    const featuredImage = post.jetpack_featured_media_url
      ? `<div class="aspect-video mb-4 rounded-md overflow-hidden">
           <img src="${post.jetpack_featured_media_url}" class="w-full h-full object-cover" alt="Featured Image">
         </div>`
      : "";

    const contentStyled = post.content.rendered
      .replace(/<blockquote>(.*?)<\/blockquote>/gs, '<blockquote class="border-l-4 border-green-600 bg-green-50 text-green-800 italic pl-4 py-2 my-4 rounded-md">$1</blockquote>')
      .replace(/<hr\s*\/?>/g, '<div class="my-8 border-t-2 border-dashed border-gray-300"></div>')
      .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, '<pre class="bg-gray-900 text-white rounded-lg overflow-auto p-4 text-sm mt-4 mb-4">$1</pre>');

    container.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-md">
        ${featuredImage}
        <h1 class="text-3xl mb-4">${post.title.rendered}</h1>
        <div class="prose prose-green prose-lg max-w-none leading-relaxed">
          ${contentStyled}
        </div>

        <div class="flex gap-4 items-center mb-4 mt-6">
          <button id="like-btn" class="flex items-center gap-2 text-green-600">
            <i class="fa-regular fa-thumbs-up"></i> Like <span id="like-count">0</span>
          </button>
          <button id="comment-btn" class="flex items-center gap-2 text-blue-600">
            <i class="fa-regular fa-comment"></i> Comment <span id="comment-count">0</span>
          </button>
          <button id="share-btn" class="flex items-center gap-2 text-purple-600">
            <i class="fa-solid fa-share"></i> Share <span id="share-count">0</span>
          </button>
        </div>

        <form id="comment-form" class="flex gap-2 mb-4">
          <input type="text" id="comment-input" placeholder="Write a comment..." class="flex-1 border rounded p-2" />
          <button type="submit" class="bg-blue-600 text-white px-4 rounded">Post</button>
        </form>

        <div id="comment-list" class="flex flex-col mb-4"></div>

        <div class="flex gap-4">
          <a href="#" class="text-blue-700"><i class="fab fa-facebook fa-lg"></i></a>
          <a href="#" class="text-blue-400"><i class="fab fa-twitter fa-lg"></i></a>
          <a href="#" class="text-pink-600"><i class="fab fa-instagram fa-lg"></i></a>
          <a href="#" class="text-red-600"><i class="fab fa-whatsapp fa-lg"></i></a>
        </div>
      </div>
    `;

    setupFirebase();
  })
  .catch(err => {
    console.error(err);
    container.innerHTML = "<p class='text-red-600 font-semibold'>Post not found or failed to load.</p>";
  });

// Firebase setup for likes/comments/shares
function setupFirebase() {
  const likesRef = ref(db, `posts/${postId}/likes`);
  const sharesRef = ref(db, `posts/${postId}/shares`);
  const commentsRef = ref(db, `posts/${postId}/comments`);

  const likeBtn = document.getElementById("like-btn");
  const shareBtn = document.getElementById("share-btn");
  const commentForm = document.getElementById("comment-form");
  const commentList = document.getElementById("comment-list");

  onValue(likesRef, snapshot => document.getElementById('like-count').textContent = snapshot.val() || 0);
  onValue(sharesRef, snapshot => document.getElementById('share-count').textContent = snapshot.val() || 0);

  likeBtn.addEventListener('click', () => set(likesRef, increment(1)));
  shareBtn.addEventListener('click', () => set(sharesRef, increment(1)));

  commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const commentText = document.getElementById('comment-input').value.trim();
    if (!commentText) return;
    push(commentsRef, { text: commentText, timestamp: Date.now() });
    document.getElementById('comment-input').value = '';
  });

  onValue(commentsRef, snapshot => {
    const data = snapshot.val() || {};
    commentList.innerHTML = '';
    document.getElementById('comment-count').textContent = Object.keys(data).length;
    Object.values(data).forEach(c => {
      const div = document.createElement('div');
      div.className = "border p-2 rounded mb-2 bg-gray-50";
      div.textContent = c.text;
      commentList.appendChild(div);
    });
  });
}
