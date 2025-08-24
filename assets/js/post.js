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
      ? `<div class="aspect-video rounded-xl overflow-hidden mb-6 shadow-lg border border-gray-200">
           <img src="${post.jetpack_featured_media_url}" class="w-full h-full object-cover rounded-lg shadow-md" alt="Featured Image">
         </div>`
      : "";

    // Style content
let contentStyled = post.content.rendered
  // Headings with custom sizes, green, shadow, and spacing
  .replace(/<h1>(.*?)<\/h1>/g, '<h1 class="text-green-700 font-semibold mt-6 mb-4 drop-shadow-sm text-[32px]">$1</h1>')
  .replace(/<h2>(.*?)<\/h2>/g, '<h2 class="text-green-700 font-semibold mt-5 mb-3 drop-shadow-sm text-[24px]">$1</h2>')
  .replace(/<h([3-5])>(.*?)<\/h[3-5]>/g, '<h$1 class="text-green-700 font-semibold mt-4 mb-3 drop-shadow-sm text-[20px]">$2</h$1>')

  // Paragraphs
  .replace(/<p>(.*?)<\/p>/g, '<p class="mb-4 leading-relaxed text-gray-800">$1</p>')

  // Blockquotes
  .replace(/<blockquote>(.*?)<\/blockquote>/gs, '<blockquote class="border-l-4 border-green-600 bg-green-50 text-green-800 italic pl-4 py-2 my-4 rounded-md">$1</blockquote>')

  // Horizontal rules
  .replace(/<hr\s*\/?>/g, `
  <div class="my-6 h-1 rounded-full bg-gradient-to-r from-green-400 via-green-600 to-green-400"></div>
`)
  
  // Code blocks
  .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, '<pre class="bg-gray-900 text-white rounded-lg overflow-auto p-4 text-sm my-6">$1</pre>')

  // Responsive Tables with rounded corners
  .replace(/<table>/g, `
    <div class="overflow-x-auto my-6">
      <table class="w-full border border-green-600 border-collapse rounded-lg">
  `)
  .replace(/<\/table>/g, '</table></div>')
  .replace(/<th>(.*?)<\/th>/g, '<th class="border border-green-600 text-black font-bold bg-orange-200 px-3 py-2 rounded-tl-lg rounded-tr-lg">$1</th>')
  .replace(/<td>(.*?)<\/td>/g, '<td class="border border-green-600 text-black px-3 py-2">$1</td>')

  // Images inside content: rounded + boxed + shadow
  .replace(/<img(.*?)>/g, '<div class="my-6 rounded-xl overflow-hidden border border-gray-200 shadow-md"><img$1 class="w-full h-auto object-cover rounded-lg"></div>');

    // Premium YouTube/iframe embed
    contentStyled = contentStyled.replace(/<iframe(.*?)><\/iframe>/g, (match, attrs) => {
      return `
        <div class="my-6 relative group rounded-xl overflow-hidden border border-gray-200 shadow-lg" style="padding-top:56.25%;">
          <iframe ${attrs} class="absolute top-0 left-0 w-full h-full rounded-xl" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen></iframe>
          <div class="absolute top-0 left-0 w-full h-full bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"></div>
          <div class="absolute inset-0 flex justify-center items-center pointer-events-none">
            <button class="bg-white bg-opacity-90 text-green-700 p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <i class="fas fa-play fa-lg"></i>
            </button>
          </div>
        </div>
      `;
    });

    // Inject post
    container.innerHTML = `
      <div class="w-full max-w-3xl px-4 py-4">
        <div class="bg-white p-6 rounded-2xl shadow-lg opacity-0 transition-opacity duration-700" id="post-content-wrapper">
          ${featuredImage}
          <h1 class="text-2xl font-bold mb-4 text-green-700 drop-shadow-sm">${post.title.rendered}</h1>
          <div class="prose prose-green prose-lg max-w-none leading-relaxed">
            ${contentStyled}
          </div>
        </div>
      </div>
    `;

    // Fade-in animation
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

// ✅ Back to top button (Vanilla JS)
const backToTopBtn = document.createElement("button");
backToTopBtn.innerText = "↑ Back to top";
backToTopBtn.setAttribute("aria-label", "Back to top");

Object.assign(backToTopBtn.style, {
  position: "fixed",
  right: "1.25rem",
  bottom: "1.25rem",
  padding: "0.75rem 1rem",
  borderRadius: "9999px",
  background: "#1d4ed8",
  color: "#ffffff",
  border: "none",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow:
    "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
  opacity: "0",
  transform: "translateY(8px)",
  transition: "opacity 200ms ease, transform 200ms ease",
  zIndex: "1000",
});

document.body.appendChild(backToTopBtn);

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    backToTopBtn.style.opacity = "1";
    backToTopBtn.style.transform = "translateY(0)";
  } else {
    backToTopBtn.style.opacity = "0";
    backToTopBtn.style.transform = "translateY(8px)";
  }
});

backToTopBtn.addEventListener("click", () => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.scrollTo(0, 0);
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});
