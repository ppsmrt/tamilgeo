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

    console.log("Fetched post:", wpPost);

    const featuredImage = wpPost.jetpack_featured_media_url
      ? `<div class="aspect-video rounded-xl overflow-hidden mb-6 shadow-lg border border-gray-200">
           <img src="${wpPost.jetpack_featured_media_url}" class="w-full h-full object-cover rounded-lg shadow-md" alt="Featured Image">
         </div>`
      : "";

    let contentStyled = wpPost.content.rendered
      .replace(/<h1>(.*?)<\/h1>/g, '<h1 class="text-green-700 font-semibold mt-6 mb-4 drop-shadow-sm text-[32px]">$1</h1>')
      .replace(/<h2>(.*?)<\/h2>/g, '<h2 class="text-green-700 font-semibold mt-5 mb-3 drop-shadow-sm text-[24px]">$1</h2>')
      .replace(/<h([3-5])>(.*?)<\/h[3-5]>/g, '<h$1 class="text-green-700 font-semibold mt-4 mb-3 drop-shadow-sm text-[20px]">$2</h$1>')
      .replace(/<p>(.*?)<\/p>/g, '<p class="mb-4 leading-relaxed text-gray-800">$1</p>')
      .replace(/<blockquote>(.*?)<\/blockquote>/gs, '<blockquote class="border-l-4 border-green-600 bg-green-50 text-green-800 italic pl-4 py-2 my-4 rounded-md">$1</blockquote>')
      .replace(/<hr\s*\/?>/g, `<div class="my-6 h-1 rounded-full bg-gradient-to-r from-green-400 via-green-600 to-green-400"></div>`)
      .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, '<pre class="bg-gray-900 text-white rounded-lg overflow-auto p-4 text-sm my-6">$1</pre>')
      .replace(/<table>/g, `<div class="overflow-x-auto my-6"><table class="w-full border border-green-600 border-collapse rounded-lg">`)
      .replace(/<\/table>/g, '</table></div>')
      .replace(/<th>(.*?)<\/th>/g, '<th class="border border-green-600 text-black font-bold bg-orange-200 px-3 py-2 rounded-tl-lg rounded-tr-lg">$1</th>')
      .replace(/<td>(.*?)<\/td>/g, '<td class="border border-green-600 text-black px-3 py-2">$1</td>')
      .replace(/<img(.*?)>/g, '<div class="my-6 rounded-xl overflow-hidden border border-gray-200 shadow-md"><img$1 class="w-full h-auto object-cover rounded-lg"></div>');

    // Inject HTML
    container.innerHTML = `
  <div class="w-full max-w-3xl px-4 py-4">
    <div class="bg-white p-6 rounded-2xl shadow-lg opacity-0 transition-opacity duration-700" id="post-content-wrapper">
      ${featuredImage}
      <h1 class="text-2xl font-bold mb-4 text-green-700 drop-shadow-sm">${wpPost.title.rendered}</h1>
      <div class="prose prose-green prose-lg max-w-none leading-relaxed">${contentStyled}</div>

      <!-- Author: simplified -->
      <div id="authorSection" class="mt-6 mb-6">
        <p class="text-gray-800 font-semibold">${wpPost.author?.name || "Admin"}</p>
        <p class="text-sm text-gray-500">@tamilgeo</p>
        <p class="text-xs text-gray-400">Posted on: ${new Date(wpPost.date).toDateString()}</p>
        <span class="text-sm px-2 py-1 rounded-full bg-gradient-to-r from-green-500 to-green-700 text-white font-medium">
          ${wpPost.categories?.map(catId => wpPost._embedded?.['wp:term']?.[0]?.find(c => c.id === catId)?.name).filter(Boolean).join(', ') || ''}
        </span>
      </div>

      <!-- Reactions with FA icons -->
      <div id="likeSection" class="border-t border-gray-200 pt-3 mt-4">
        <h3 class="text-gray-700 font-medium mb-2">React to this Post</h3>
        <div class="flex space-x-4" id="likeReactions">
          <button data-reaction="love" class="text-2xl"><i class="fa fa-heart"></i></button>
          <button data-reaction="laugh" class="text-2xl"><i class="fa fa-laugh"></i></button>
          <button data-reaction="wow" class="text-2xl"><i class="fa fa-surprise"></i></button>
          <button data-reaction="sad" class="text-2xl"><i class="fa fa-sad-tear"></i></button>
          <button data-reaction="like" class="text-2xl"><i class="fa fa-thumbs-up"></i></button>
        </div>
        <div id="likeCounts" class="mt-2 text-sm text-gray-500"></div>
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

    // Reactions logic with colors and animations
    const likeButtons = document.querySelectorAll('#likeReactions button');
    const likeCounts = document.getElementById('likeCounts');

    const reactionColors = {
      love: "text-red-500",
      laugh: "text-yellow-400",
      wow: "text-purple-500",
      sad: "text-blue-400",
      like: "text-green-500"
    };

    likeButtons.forEach(btn => {
      const reaction = btn.dataset.reaction;
      btn.classList.add(reactionColors[reaction], "transition-transform", "duration-300", "cursor-pointer");

      btn.addEventListener("mouseenter", () => btn.classList.add("scale-125"));
      btn.addEventListener("mouseleave", () => btn.classList.remove("scale-125"));

      btn.addEventListener("click", async () => {
        if (!currentUser) return alert("Login to react");
        btn.classList.add("animate-pulse");
        setTimeout(() => btn.classList.remove("animate-pulse"), 500);

        const likesRef = ref(db, `likes/${postId}`);
        const snap = await get(likesRef);
        const currentData = snap.val() || {};
        currentData[`${reaction}_${currentUser.uid}`] = reaction;
        update(likesRef, currentData);
      });
    });

    onValue(ref(db, `likes/${postId}`), snapshot => {
      const likes = snapshot.val() || {};
      const counts = {};
      Object.values(likes).forEach(r => counts[r] = (counts[r] || 0) + 1);
      likeCounts.textContent = Object.entries(counts).map(([k,v]) => `${k}: ${v}`).join(' | ');
    });

    // Comments logic
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