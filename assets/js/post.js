import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, push, onValue, update } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ✅ Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDt86oFFa-h04TsfMWSFGe3UHw26WYoR-U",
  authDomain: "tamilgeoapp.firebaseapp.com",
  databaseURL: "https://tamilgeoapp-default-rtdb.firebaseio.com",
  projectId: "tamilgeoapp",
  storageBucket: "tamilgeoapp.appspot.com",
  messagingSenderId: "1092623024431",
  appId: "1:1092623024431:web:ea455dd68a9fcf480be1da"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// ✅ Get post ID from URL
const postId = new URLSearchParams(window.location.search).get("id");
const container = document.getElementById("post-container");

// ✅ Validate postId
if (!postId || isNaN(postId)) {
  container.innerHTML = "<p class='text-red-500 text-center'>Invalid or missing Post ID.</p>";
  console.error("Invalid Post ID:", postId);
  return;
}

// ✅ WordPress API URL
const postURL = `https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts/${postId}`;

// ✅ Fetch post and render
fetch(postURL)
  .then(res => {
    if (!res.ok) {
      console.error(`Fetch failed with status: ${res.status}`);
      throw new Error(`Failed to fetch post: ${res.status}`);
    }
    return res.json();
  })
  .then(post => {
    if (!post || post.code === 'rest_post_invalid_id') {
      container.innerHTML = "<p class='text-red-600 font-semibold text-center'>Post not found.</p>";
      return;
    }

    console.log("Fetched post:", post); // Debug log

    const featuredImage = post.jetpack_featured_media_url
      ? `<div class="aspect-video rounded-xl overflow-hidden mb-6 shadow-lg border border-gray-200">
           <img src="${post.jetpack_featured_media_url}" class="w-full h-full object-cover rounded-lg shadow-md" alt="Featured Image">
         </div>`
      : "";

    // ✅ Style post content
    let contentStyled = post.content.rendered
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

    // ✅ Inject post + comments section
    container.innerHTML = `
      <div class="w-full max-w-3xl px-4 py-4">
        <div class="bg-white p-6 rounded-2xl shadow-lg opacity-0 transition-opacity duration-700" id="post-content-wrapper">
          ${featuredImage}
          <h1 class="text-2xl font-bold mb-4 text-green-700 drop-shadow-sm">${post.title.rendered}</h1>
          <div class="prose prose-green prose-lg max-w-none leading-relaxed">
            ${contentStyled}
          </div>

          <!-- ✅ Author Section -->
          <div class="mt-8 p-4 bg-gray-50 rounded-2xl shadow-md">
            <div class="flex items-center mb-4">
              <img src="https://ppsmrt.github.io/tamilgeo/assets/icon/Logo.jpg" class="w-14 h-14 rounded-full border-2 border-green-500" alt="Author">
              <div class="ml-4">
                <h2 class="text-lg font-semibold text-gray-800">Admin</h2>
                <p class="text-sm text-gray-500">@admin • tamilgeo</p>
                <p class="text-xs text-gray-400">Posted on: ${new Date(post.date).toDateString()}</p>
              </div>
            </div>
          </div>

          <!-- ✅ Like Section -->
          <div class="border-t border-gray-200 pt-3">
            <h3 class="text-gray-700 font-medium mb-2">React to this Post</h3>
            <div class="flex space-x-4" id="likeReactions">
              <button data-reaction="love" class="text-2xl hover:scale-125 transition">❤️</button>
              <button data-reaction="laugh" class="text-2xl hover:scale-125 transition">😂</button>
              <button data-reaction="wow" class="text-2xl hover:scale-125 transition">😮</button>
              <button data-reaction="sad" class="text-2xl hover:scale-125 transition">😢</button>
              <button data-reaction="like" class="text-2xl hover:scale-125 transition">👍</button>
            </div>
            <div id="likeCounts" class="mt-2 text-sm text-gray-500"></div>
          </div>

          <!-- ✅ Comments -->
          <div class="mt-10">
            <h2 class="text-lg font-semibold mb-4 text-gray-700">Comments</h2>
            <div id="comment-box" class="flex items-center bg-gradient-to-r from-green-400 via-green-600 to-green-400 rounded-xl p-2 mb-6">
              <input type="text" id="commentInput" placeholder="Write your comment..." class="flex-1 bg-white rounded-xl p-3 outline-none text-gray-800" />
              <button id="submitComment" class="ml-2 text-white p-2 rounded-full hover:bg-green-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </button>
            </div>
            <div id="commentsList" class="space-y-4"></div>
          </div>
        </div>
      </div>
    `;

    // ✅ Fade-in effect
    const wrapper = document.getElementById("post-content-wrapper");
    requestAnimationFrame(() => {
      wrapper.classList.remove("opacity-0");
      wrapper.classList.add("opacity-100");
    });

    // ✅ Firebase Comments Logic
    const commentInput = document.getElementById("commentInput");
    const submitComment = document.getElementById("submitComment");
    const commentsList = document.getElementById("commentsList");
    const commentsRef = ref(db, `comments/${postId}`);

    let currentUser = null;

    onAuthStateChanged(auth, user => {
      if (user) {
        currentUser = user;
      } else {
        document.getElementById("comment-box").innerHTML = `
          <p class="text-center text-white w-full">Please <a href="/tamilgeo/login.html" class="text-green-600 font-semibold">login</a> to comment.</p>
        `;
      }
    });

    submitComment.addEventListener("click", () => {
      const text = commentInput.value.trim();
      if (!text) return alert("Comment cannot be empty!");
      if (!currentUser) return alert("You must be logged in!");

      push(commentsRef, {
        author: currentUser.displayName || "Anonymous",
        text,
        likes: 0,
        replies: []
      });

      commentInput.value = "";
    });

    onValue(commentsRef, snapshot => {
      commentsList.innerHTML = "";
      const data = snapshot.val();
      if (!data) {
        commentsList.innerHTML = "<p class='text-gray-500 text-center'>No comments yet. Be the first!</p>";
        return;
      }

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
              <button data-id="${id}" class="likeBtn hover:text-green-600"><i class="fa-regular fa-heart"></i> ${comment.likes}</button>
              <button data-id="${id}" class="replyBtn hover:text-green-600">Reply</button>
            </div>
          </div>
        `;
        commentsList.appendChild(div);
      });

      document.querySelectorAll(".likeBtn").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = e.currentTarget.getAttribute("data-id");
          update(ref(db, `comments/${postId}/${id}`), { likes: (data[id].likes || 0) + 1 });
        });
      });

      document.querySelectorAll(".replyBtn").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = e.currentTarget.getAttribute("data-id");
          const replyText = prompt(`Reply to ${data[id].author}`);
          if (replyText) {
            const replies = data[id].replies || [];
            replies.push({ author: currentUser.displayName || "Anonymous", text: `@${data[id].author} ${replyText}` });
            update(ref(db, `comments/${postId}/${id}`), { replies });
          }
        });
      });
    });

  })
  .catch(err => {
    console.error("Fetch Error:", err);
    container.innerHTML = "<p class='text-red-600 font-semibold text-center'>Post not found or failed to load.</p>";
  });

// ✅ Feather icons
feather.replace();

// ✅ Firebase Refs for Reactions
const ratingRef = ref(db, `ratings/${postId}`);
const likesRef = ref(db, `likes/${postId}`);

// ✅ Like Reactions Logic
const likeButtons = document.querySelectorAll('#likeReactions button');
const likeCounts = document.getElementById('likeCounts');

likeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (!currentUser) return alert("Login to react");
    const reaction = btn.dataset.reaction;
    update(likesRef, { [`${reaction}_${currentUser.uid}`]: reaction });
  });
});

onValue(likesRef, snapshot => {
  const likes = snapshot.val() || {};
  const counts = {};
  Object.values(likes).forEach(r => counts[r] = (counts[r] || 0) + 1);
  likeCounts.textContent = Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(' | ');
});