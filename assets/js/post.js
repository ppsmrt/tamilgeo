// Firebase setup
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, push, get, onValue } from "firebase/database";

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
const db = getDatabase(app);

// Get Post ID from URL
const postId = new URLSearchParams(window.location.search).get("id");
const postURL = `https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts/${postId}`;
const container = document.getElementById("post-container");

// Fetch and render post
fetch(postURL)
  .then(res => res.json())
  .then(post => {
    const image = post.jetpack_featured_media_url
      ? `<img src="${post.jetpack_featured_media_url}" class="w-full h-60 object-cover rounded-md mb-4">`
      : "";

    // Wrap videos in responsive container
    const contentWithResponsiveVideos = post.content.rendered.replace(
      /<iframe.*?<\/iframe>/g,
      match => `<div class="video-container">${match}</div>`
    );

    // Apply Tailwind styles dynamically
    const styledContent = contentWithResponsiveVideos
      // Paragraph spacing and line height
      .replace(/<p>/g, '<p class="mb-5 leading-relaxed">')
      // Headings green and sized
      .replace(/<h1>/g, '<h1 class="text-green-600 text-3xl font-bold mb-4 mt-8">')
      .replace(/<h2>/g, '<h2 class="text-green-600 text-2xl font-bold mb-4 mt-6">')
      .replace(/<h3>/g, '<h3 class="text-green-600 text-xl font-semibold mb-3 mt-5">')
      .replace(/<h4>/g, '<h4 class="text-green-600 text-lg font-semibold mb-3 mt-4">')
      .replace(/<h5>/g, '<h5 class="text-green-600 text-base font-semibold mb-2 mt-3">')
      // Blockquotes styling
      .replace(
        /<blockquote>/g,
        '<blockquote class="border-l-4 border-green-600 bg-gray-50 p-4 rounded-md italic text-gray-700 my-6">'
      )
      // Images in a box with shadow
      .replace(
        /<img /g,
        '<img class="mx-auto my-6 rounded-xl shadow-md border border-gray-200 p-1 bg-white" '
      );

    // Calculate Posted Days Ago
    const postDate = new Date(post.date);
    const today = new Date();
    const diffDays = Math.floor((today - postDate) / (1000 * 60 * 60 * 24));

    container.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-2xl font-bold mb-2">${post.title.rendered}</h2>
        <div class="text-sm text-gray-500 mb-4">
          👤 Author: TamilGeo | 🗓️ ${postDate.toLocaleDateString()}
        </div>
        ${image}
        <div class="post-content prose prose-lg max-w-none mb-6">${styledContent}</div>

        <!-- 🔽 NEW AUTHOR META SECTION 🔽 -->
        <div class="border-t border-gray-200 pt-4 mb-4 text-sm text-gray-700">
          <p><strong><i data-feather="user-check"></i>
 Author:</strong> ${post.author === 1 ? "Admin" : "Full Name from Firebase"}</p>
          <p><strong>📂 Category:</strong> ${post.categories && post.categories.length > 0 ? post.categories.join(", ") : "Uncategorized"}</p>
          <p><strong>⏳ Posted:</strong> ${diffDays} days ago</p>
        </div>
        <!-- 🔼 END AUTHOR META SECTION 🔼 -->

        <!-- Like & Share -->
        <div class="mt-4 flex items-center gap-3">
          <button onclick="likePost()" class="btn-gradient px-3 py-1 rounded">♥ Like</button>
          <span id="like-count" class="text-sm text-gray-600">♥ 0 Likes</span>
          <button onclick="sharePost()" class="btn-gradient px-3 py-1 rounded">🔗 Share</button>
        </div>

        <!-- Comment Section -->
        <div class="mt-6">
          <h3 class="font-semibold text-lg mb-2">💬 Comments</h3>
          <textarea placeholder="Write a comment..." class="w-full p-2 border rounded mb-2" id="comment-box"></textarea>
          <button onclick="addComment()" class="btn-gradient px-3 py-1 rounded">Post Comment</button>
          <div id="comments" class="mt-4 space-y-2 text-sm text-gray-700"></div>
        </div>
      </div>
    `;

    // Load Firebase data
    updateLikeCount();
    loadComments();
  });

// Like functionality
function likePost() {
  const likeRef = ref(db, `likes/post_${postId}`);
  get(likeRef).then(snapshot => {
    const currentLikes = snapshot.exists() ? snapshot.val() : 0;
    set(likeRef, currentLikes + 1);
    updateLikeCount();
    alert("♥ You liked this post!");
  });
}

function updateLikeCount() {
  const likeRef = ref(db, `likes/post_${postId}`);
  onValue(likeRef, snapshot => {
    const likeCount = snapshot.exists() ? snapshot.val() : 0;
    document.getElementById("like-count").innerText = `♥ ${likeCount} Likes`;
  });
}

// Share
function sharePost() {
  const url = window.location.href;
  navigator.clipboard.writeText(url);
  alert("🔗 Post link copied to clipboard!");
}

// Comment functionality
function addComment() {
  const commentBox = document.getElementById("comment-box");
  const commentText = commentBox.value.trim();
  if (!commentText) return;

  const commentRef = ref(db, `comments/post_${postId}`);
  push(commentRef, commentText).then(() => {
    commentBox.value = "";
    loadComments();
  });
}

function loadComments() {
  const commentRef = ref(db, `comments/post_${postId}`);
  onValue(commentRef, snapshot => {
    const commentsDiv = document.getElementById("comments");
    commentsDiv.innerHTML = "";
    if (snapshot.exists()) {
      const comments = snapshot.val();
      Object.values(comments).forEach(comment => {
        commentsDiv.innerHTML += `<div class="comment-boxed">${comment}</div>`;
      });
    }
  });
}
