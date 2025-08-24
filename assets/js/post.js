import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

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
initializeApp(firebaseConfig);

// Get post ID from URL
const postId = new URLSearchParams(window.location.search).get("id");
const container = document.getElementById("post-container");

if (!postId) {
  container.innerHTML = "<p class='text-red-500 text-center'>Invalid Post ID.</p>";
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
      ? `<div class="aspect-video rounded-xl overflow-hidden mb-6 shadow-md">
           <img src="${post.jetpack_featured_media_url}" class="w-full h-full object-cover" alt="Featured Image">
         </div>`
      : "";

    // Style content: headings green, paragraphs, images, code blocks
    let contentStyled = post.content.rendered
      // Headings H1–H6 in green
      .replace(/<h([1-6])>(.*?)<\/h[1-6]>/g, '<h$1 class="text-green-700 font-semibold mt-6 mb-4 text-[calc(1.25rem+0.25rem*($1-1))]">$2</h$1>')
      // Paragraphs
      .replace(/<p>(.*?)<\/p>/g, '<p class="mb-4 leading-relaxed text-gray-800">$1</p>')
      // Blockquotes
      .replace(/<blockquote>(.*?)<\/blockquote>/gs, '<blockquote class="border-l-4 border-green-600 bg-green-50 text-green-800 italic pl-4 py-2 my-4 rounded-md">$1</blockquote>')
      // Horizontal rules
      .replace(/<hr\s*\/?>/g, '<div class="my-6 border-t-2 border-dashed border-gray-300"></div>')
      // Code blocks
      .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, '<pre class="bg-gray-900 text-white rounded-lg overflow-auto p-4 text-sm my-6">$1</pre>')
      // Images inside content
      .replace(/<img(.*?)>/g, '<img$1 class="rounded-lg mb-6 w-full object-cover">');

    container.innerHTML = `
      <div class="w-full max-w-3xl px-4 py-4">
        <div class="bg-white p-6 rounded-2xl shadow-lg opacity-0 transition-opacity duration-700" id="post-content-wrapper">
          ${featuredImage}
          <h1 class="text-2xl font-bold mb-4 text-green-700">${post.title.rendered}</h1>
          <div class="prose prose-green prose-lg max-w-none leading-relaxed">
            ${contentStyled}
          </div>
        </div>
      </div>
    `;

    // Fade-in post
    const wrapper = document.getElementById("post-content-wrapper");
    requestAnimationFrame(() => {
      wrapper.classList.remove("opacity-0");
      wrapper.classList.add("opacity-100");
    });

  })
  .catch(err => {
    console.error(err);
    container.innerHTML = "<p class='text-red-600 font-semibold text-center'>Post not found or failed to load.</p>";
  });
