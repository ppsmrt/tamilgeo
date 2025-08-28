import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, push, onValue, update, get } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

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

const postId = new URLSearchParams(window.location.search).get("id");
const container = document.getElementById("post-container");

if (!postId) {
  container.innerHTML = "<p class='text-red-500 text-center'>Invalid Post ID.</p>";
  throw new Error("Missing post ID");
}

const isNumeric = !isNaN(postId);
const postURL = isNumeric
  ? `https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts/${postId}?_embed`
  : `https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts?slug=${postId}&_embed`;

let currentUser = null;

document.addEventListener("DOMContentLoaded", async () => {
  onAuthStateChanged(auth, user => currentUser = user);

  try {
    const res = await fetch(postURL);
    if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
    const post = await res.json();
    const wpPost = Array.isArray(post) ? post[0] : post;
    if (!wpPost) {
      container.innerHTML = "<p class='text-red-600 font-semibold text-center'>Post not found.</p>";
      return;
    }

    const featuredImage = wpPost.jetpack_featured_media_url
      ? `<div class="aspect-video rounded-xl overflow-hidden mb-6 shadow-lg border border-gray-200">
           <img src="${wpPost.jetpack_featured_media_url}" class="w-full h-full object-cover rounded-lg shadow-md" alt="Featured Image">
         </div>`
      : "";

    // ---- CONTENT STYLING ----
    let contentStyled = wpPost.content.rendered
      // Headings
      .replace(/<h1>([\s\S]*?)<\/h1>/gi, '<h1 class="text-green-700 font-bold mt-6 mb-4 text-[32px]">$1</h1>')
      .replace(/<h2>([\s\S]*?)<\/h2>/gi, '<h2 class="text-blue-600 font-bold mt-5 mb-3 text-[24px]">$1</h2>')
      .replace(/<h3>([\s\S]*?)<\/h3>/gi, '<h3 class="text-blue-600 font-bold mt-4 mb-3 text-[20px]">$1</h3>')
      .replace(/<h4>([\s\S]*?)<\/h4>/gi, '<h4 class="text-blue-600 font-bold mt-3 mb-2 text-[20px]">$1</h4>')
      .replace(/<h5>([\s\S]*?)<\/h5>/gi, '<h5 class="text-blue-600 font-bold mt-2 mb-2 text-[20px]">$1</h5>')
      // Paragraphs
      .replace(/<p>(.*?)<\/p>/gi, '<p class="mb-4 leading-relaxed text-gray-800">$1</p>')
      // Blockquote
      .replace(/<blockquote>([\s\S]*?)<\/blockquote>/gi, '<blockquote class="border-l-4 border-green-600 bg-green-50 text-green-800 italic pl-4 py-2 my-4 rounded-md">$1</blockquote>')
      // HR separator with padding
      .replace(/<hr\s*\/?>/gi, `<div class="my-2 h-1 rounded-full bg-gradient-to-r from-green-400 via-green-600 to-green-400"></div>`)
      // Code blocks
      .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, '<pre class="bg-gray-900 text-white rounded-lg overflow-auto p-4 text-sm my-6">$1</pre>')
      // Tables
      .replace(/<table>/gi, `<div class="overflow-x-auto my-6"><table class="w-full border border-green-600 border-collapse rounded-lg">`)
      .replace(/<\/table>/gi, '</table></div>')
      .replace(/<th>(.*?)<\/th>/gi, '<th class="border border-green-600 text-black font-bold bg-orange-200 px-3 py-2 rounded-tl-lg rounded-tr-lg">$1</th>')
      .replace(/<td>(.*?)<\/td>/gi, '<td class="border border-green-600 text-black px-3 py-2">$1</td>')
      // Images
      .replace(/<img(.*?)>/gi, '<div class="my-6 rounded-xl overflow-hidden border border-gray-200 shadow-md"><img$1 class="w-full h-auto object-cover rounded-lg"></div>')
      // YouTube / iframes
      .replace(/<iframe(.*?)<\/iframe>/gi, (match, p1) => {
        return `<div class="my-6 overflow-hidden rounded-xl relative w-full aspect-video">
                  <iframe${p1} class="w-full h-full rounded-xl" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
                </div>`;
      })
      // External links
      .replace(/<a\s+(?![^>]*href="https:\/\/tamilgeo\.wordpress\.com)([^>]*?)>(.*?)<\/a>/gi, '<a $1 class="font-bold text-red-600" target="_blank" rel="noopener noreferrer">$2</a>');

    const categoryName = wpPost.categories?.map(catId =>
      wpPost._embedded?.['wp:term']?.[0]?.find(c => c.id === catId)?.name
    ).filter(Boolean).join(', ') || 'General';

    const authorLogo = "https://ppsmrt.github.io/tamilgeo/assets/icon/Logo.jpg";
    const authorName = wpPost.author ? wpPost._embedded.author?.[0]?.name || "Admin" : "Admin";
    const username = "@tamilgeo";

    container.innerHTML = `
<div class="w-full max-w-3xl px-4 py-4">
  <div class="bg-white p-6 rounded-2xl shadow-lg opacity-0 transition-opacity duration-700" id="post-content-wrapper">
    ${featuredImage}
    <h1 class="text-2xl font-bold mb-4 text-green-700 drop-shadow-sm">${wpPost.title.rendered}</h1>

    <div class="prose prose-green prose-lg max-w-none leading-relaxed">${contentStyled}</div>

    <!-- Admin/Author Panel -->
    <div class="flex items-center justify-between bg-gray-50 rounded-xl shadow p-4 mb-6 mt-8">
      <div>
        <img src="${authorLogo}" alt="Author Logo" class="w-16 h-16 rounded-full border-2 border-green-500">
      </div>
      <div class="flex flex-col text-center px-4 flex-grow">
        <h2 class="text-lg font-semibold">${authorName}</h2>
        <p class="text-gray-500">${username}</p>
        <span class="text-sm text-blue-500">${categoryName}</span>
      </div>
      <div class="relative">
        <button id="mainLikeBtn" class="relative flex items-center justify-center w-16 h-16 bg-red-500 rounded-full shadow-lg hover:bg-red-600 transition duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41 1.01 4.22 2.55C11.09 5.01 12.76 4 14.5 4 17 4 19 6 19 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
          <span id="mainLikeCount" class="absolute text-white font-bold text-lg">0</span>
        </button>
      </div>
    </div>

    <!-- Comments Section -->
    <div id="commentSection" class="mt-10">
      <h2 class="text-lg font-semibold mb-4 text-gray-700">Comments</h2>
      <div id="comment-box" class="flex items-center bg-gradient-to-r from-green-400 via-green-600 to-green-400 rounded-xl p-2 mb-6">
        <input type="text" id="commentInput" placeholder="Write your comment..." class="flex-1 bg-white rounded-xl p-3 outline-none text-gray-800" />
        <button id="submitComment" class="ml-2 text-white p-2 rounded-full hover:bg-green-700">
          <i class="fa fa-paper-plane"></i>
        </button>
      </div>
      <div id="commentsList" class="space-y-4"></div>
    </div>
  </div>
</div>
`;

    const wrapper = document.getElementById("post-content-wrapper");
    requestAnimationFrame(() => {
      wrapper.classList.remove("opacity-0");
      wrapper.classList.add("opacity-100");
    });

    // ---------- LIKE BUTTON ----------
    const mainLikeBtn = document.getElementById("mainLikeBtn");
    const mainLikeCount = document.getElementById("mainLikeCount");
    const mainLikeRef = ref(db, `mainLikes/${postId}`);

    mainLikeBtn.addEventListener("click", async () => {
      if (!currentUser) return alert("Login to like this post!");
      const snap = await get(mainLikeRef);
      let likes = snap.val()?.count || 0;
      likes++;
      await update(mainLikeRef, { count: likes });
    });

    onValue(mainLikeRef, snap => {
      mainLikeCount.textContent = snap.val()?.count || 0;
    });

    // ---------- COMMENTS ----------
    const commentInput = document.getElementById("commentInput");
    const submitComment = document.getElementById("submitComment");
    const commentsList = document.getElementById("commentsList");
    const commentsRef = ref(db, `comments/${postId}`);

    submitComment.onclick = async () => {
      const text = commentInput.value.trim();
      if (!text) return alert("Comment cannot be empty!");
      if (!currentUser) return alert("You must be logged in!");
      await push(commentsRef, { author: currentUser.displayName || "Anonymous", text, likes: 0, replies: [] });
      commentInput.value = "";
    };

    onValue(commentsRef, snapshot => {
      commentsList.innerHTML = "";
      const data = snapshot.val();
      if (!data) return commentsList.innerHTML = "<p class='text-gray-500 text-center'>No comments yet.</p>";

      Object.entries(data).forEach(([id, comment]) => {
        const div = document.createElement("div");
        div.className = "bg-gray-50 p-4 rounded-xl shadow flex flex-col";
        div.innerHTML = `
          <div class="flex justify-between items-start">
            <div>
              <p class="font-semibold text-gray-800">${comment.author}</p>
              <p class="text-gray-700 mt-1">${comment.text}</p>
            </div>
            <div class="flex space-x-2 text-gray-500">
              <button data-id="${id}" class="likeBtn hover:text-green-600">
                <i class="fa fa-heart"></i> <span class="likeCount">${comment.likes || 0}</span>
              </button>
              <button data-id="${id}" class="replyBtn hover:text-green-600">Reply</button>
            </div>
          </div>
          <div class="replies mt-2 ml-4 space-y-1"></div>
        `;
        const repliesDiv = div.querySelector(".replies");
        (comment.replies || []).forEach(r => {
          const rDiv = document.createElement("div");
          rDiv.className = "bg-green-50 p-2 rounded";
          rDiv.textContent = `${r.author}: ${r.text}`;
          repliesDiv.appendChild(rDiv);
        });
        commentsList.appendChild(div);
      });

      // Like buttons
      document.querySelectorAll(".likeBtn").forEach(btn => {
        btn.onclick = async () => {
          if (!currentUser) return alert("You must be logged in!");
          const id = btn.dataset.id;
          const snap = await get(ref(db, `comments/${postId}/${id}`));
          const likes = snap.val()?.likes || 0;
          update(ref(db, `comments/${postId}/${id}`), { likes: likes + 1 });
        };
      });

      // Reply buttons
      document.querySelectorAll(".replyBtn").forEach(btn => {
        btn.onclick = async () => {
          if (!currentUser) return alert("You must be logged in!");
          const id = btn.dataset.id;
          const replyText = prompt(`Reply to ${data[id].author}`);
          if (replyText) {
            const snap = await get(ref(db, `comments/${postId}/${id}`));
            const comment = snap.val();
            const replies = comment.replies || [];
            replies.push({ author: currentUser.displayName || "Anonymous", text: replyText });
            update(ref(db, `comments/${postId}/${id}`), { replies });
          }
        };
      });
    });

  } catch(err) {
    console.error(err);
    container.innerHTML = `<p class="text-red-500 text-center">Error loading post.</p>`;
  }
});