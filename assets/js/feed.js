import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDt86oFFa-h04TsfMWSFGe3UHw26WYoR-U",
  authDomain: "tamilgeoapp.firebaseapp.com",
  databaseURL: "https://tamilgeoapp-default-rtdb.firebaseio.com",
  projectId: "tamilgeoapp",
  storageBucket: "tamilgeoapp.appspot.com",
  messagingSenderId: "1092623024431",
  appId: "1:1092623024431:web:ea455dd68a9fcf480be1da"
};

// ✅ Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const blogURL = "https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com";
const container = document.getElementById("posts-container");
const searchInput = document.getElementById("searchInput");

let currentPage = 1;
const postsPerPage = 6;
let totalPages = null;
let isLoading = false;
let isLoggedIn = false;

// ✅ Monitor login status
onAuthStateChanged(auth, user => {
  isLoggedIn = !!user;
  container.innerHTML = "";
  currentPage = 1;
  fetchPosts();
});

// ✅ Search functionality
searchInput?.addEventListener("input", (e) => {
  const query = e.target.value.trim();
  currentPage = 1;

  if (query.length > 2) {
    fetch(`${blogURL}/posts?search=${query}&per_page=${postsPerPage}&page=1`)
      .then(res => res.json())
      .then(posts => {
        container.innerHTML = "";
        displayPosts(posts || []);
      })
      .catch(err => console.error("Search Error:", err));
  } else {
    container.innerHTML = "";
    fetchPosts();
  }
});

// ✅ Infinite scroll
window.addEventListener("scroll", () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 && !isLoading && currentPage < totalPages) {
    currentPage++;
    fetchPosts();
  }
});

// ✅ Fetch posts
function fetchPosts() {
  isLoading = true;

  fetch(`${blogURL}/posts?per_page=${postsPerPage}&page=${currentPage}`)
    .then(async res => {
      if (!res.ok) throw new Error(`Failed to fetch posts. Status: ${res.status}`);
      totalPages = parseInt(res.headers.get("X-WP-TotalPages")) || 1;
      return res.json();
    })
    .then(posts => {
      if (!Array.isArray(posts) || posts.length === 0 && currentPage === 1) {
        container.innerHTML = `<p class="text-center text-gray-500">No posts found.</p>`;
      } else {
        displayPosts(posts);
      }
      isLoading = false;
    })
    .catch(err => {
      console.error("Post Fetch Error:", err);
      container.innerHTML += `<p class="text-red-500">Error loading posts. Try again later.</p>`;
      isLoading = false;
    });
}

// ✅ Clean HTML
function stripHTML(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

// ✅ Time formatter
function timeAgo(dateString) {
  const now = new Date();
  const postDate = new Date(dateString);
  const diff = Math.floor((now - postDate) / 1000);

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

  return postDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ✅ Display posts
function displayPosts(posts) {
  const bookmarkedIds = JSON.parse(localStorage.getItem("bookmarkedPosts") || "[]");

  posts.forEach(post => {
    if (!post || !post.id || !post.title) return;

    const isBookmarked = bookmarkedIds.includes(post.id);
    const image = post.jetpack_featured_media_url
      ? `<img src="${post.jetpack_featured_media_url}" class="w-full h-40 object-cover rounded-t-md">`
      : `<div class="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500">No Image</div>`;

    const postHTML = `
      <div class="relative group mb-6">
        <a href="post.html?id=${post.id}" class="block bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition duration-300 transform hover:-translate-y-1 card">
          ${image}
          <div class="p-4">
            <h2 class="text-lg font-bold mb-2">${post.title.rendered}</h2>
            <p class="text-sm text-gray-600 mb-2">${stripHTML(post.excerpt.rendered).slice(0, 100)}...</p>
            <div class="flex flex-wrap items-center gap-3 text-xs text-gray-500 mt-4">
              <span class="flex items-center gap-1 text-blue-500"><i class="fas fa-user"></i> Admin</span>
              <span class="flex items-center gap-1 text-gray-600"><i class="fas fa-clock"></i> ${timeAgo(post.date)}</span>
              <span class="flex items-center gap-1 text-red-500"><i class="fas fa-heart"></i> ${post.like_count || 0}</span>
              <span class="flex items-center gap-1 text-green-500"><i class="fas fa-comment"></i> ${post.comment_count || 0}</span>
              <span class="flex items-center gap-1 text-yellow-500"><i class="fas fa-share"></i> ${post.share_count || 0}</span>
              <button
                class="ml-auto bookmark-btn flex items-center gap-1 px-2 py-1 rounded text-sm ${isLoggedIn ? 'bg-white hover:bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}"
                data-id="${post.id}"
                title="${isLoggedIn ? (isBookmarked ? 'Remove Bookmark' : 'Add to Bookmarks') : 'Login to Bookmark'}"
                ${isLoggedIn ? "" : "disabled"}
              >
                <i class="fas fa-bookmark"></i> ${isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </button>
            </div>
          </div>
        </a>
      </div>`;

    container.innerHTML += postHTML;
  });

  if (isLoggedIn) attachBookmarkEvents();
}

// ✅ Bookmark events
function attachBookmarkEvents() {
  document.querySelectorAll(".bookmark-btn").forEach(button => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const id = parseInt(this.dataset.id);

      // Load stored bookmarks (array of post objects)
      let bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");

      // Check if post already exists
      const exists = bookmarks.find(b => b.id === id);

      if (exists) {
        // Remove bookmark
        bookmarks = bookmarks.filter(b => b.id !== id);
        this.innerHTML = `<i class="fas fa-bookmark"></i> Bookmark`;
        this.title = "Add to Bookmarks";
      } else {
        // Get post details from DOM
        const card = this.closest(".card") || this.closest(".group");
        const title = card.querySelector("h2")?.innerText || "Untitled";
        const url = card.querySelector("a")?.href || "#";
        const image = card.querySelector("img")?.src || "";

        // Save new bookmark
        bookmarks.push({
          id,
          title,
          url,
          image
        });

        this.innerHTML = `<i class="fas fa-bookmark"></i> Bookmarked`;
        this.title = "Remove Bookmark";
      }

      // Save updated list
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));
    });
  });
}
