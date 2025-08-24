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

// WordPress API URL
const postURL = `https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts/${postId}`;

// Fetch post
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

    // Inject post with fade-in
    container.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow-md mb-8 opacity-0 transition-opacity duration-700" id="post-content-wrapper">
        ${featuredImage}
        <h1 class="text-3xl mb-4">${post.title.rendered}</h1>
        <div class="prose prose-green prose-lg max-w-none leading-relaxed">
          ${contentStyled}
        </div>
      </div>
    `;

    // Trigger fade-in
    const wrapper = document.getElementById("post-content-wrapper");
    requestAnimationFrame(() => {
      wrapper.classList.remove("opacity-0");
      wrapper.classList.add("opacity-100");
    });

  })
  .catch(err => {
    console.error(err);
    container.innerHTML = "<p class='text-red-600 font-semibold'>Post not found or failed to load.</p>";
  });
