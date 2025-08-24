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
      ? `<div class="aspect-video rounded-xl overflow-hidden mb-4 shadow-md">
           <img src="${post.jetpack_featured_media_url}" class="w-full h-full object-cover" alt="Featured Image">
         </div>`
      : "";

    const contentStyled = post.content.rendered
      .replace(/<blockquote>(.*?)<\/blockquote>/gs, '<blockquote class="border-l-4 border-green-600 bg-green-50 text-green-800 italic pl-4 py-2 my-4 rounded-md">$1</blockquote>')
      .replace(/<hr\s*\/?>/g, '<div class="my-6 border-t-2 border-dashed border-gray-300"></div>')
      .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, '<pre class="bg-gray-900 text-white rounded-lg overflow-auto p-4 text-sm my-4">$1</pre>');

    container.innerHTML = `
      <div class="w-full max-w-3xl px-4 py-6">
        <div class="bg-white p-6 rounded-2xl shadow-lg opacity-0 transition-opacity duration-700" id="post-content-wrapper">
          ${featuredImage}
          <h1 class="text-3xl font-bold mb-4">${post.title.rendered}</h1>
          <div class="prose prose-green prose-lg max-w-none leading-relaxed">
            ${contentStyled}
          </div>
        </div>
      </div>
    `;

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

<-- ✅ Back To Top -->

function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setVisible(y > 300);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      window.scrollTo(0, 0);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={scrollToTop}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          scrollToTop();
        }
      }}
      style={{
        position: "fixed",
        right: "1.25rem",
        bottom: "1.25rem",
        padding: "0.75rem 1rem",
        borderRadius: 9999,
        background: "#1d4ed8",
        color: "#ffffff",
        border: "none",
        fontWeight: 600,
        cursor: "pointer",
        boxShadow:
          "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
        opacity: visible ? 1 : 0,
        transform: `translateY(${visible ? 0 : 8}px)`,
        transition: "opacity 200ms ease, transform 200ms ease",
        zIndex: 1000,
      }}
    >
      ↑ Back to top
    </button>
  );
}