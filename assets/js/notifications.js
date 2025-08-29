document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("notifications-container");

  if (!container) {
    console.error("Container element not found: #notifications-container");
    return;
  }

  // Show loading state
  container.innerHTML = `
    <div class="text-center py-6 text-gray-500 animate-pulse">
      Loading notifications...
    </div>
  `;

  fetchRecentPosts().then(posts => {
    if (posts.length === 0) {
      container.innerHTML = `
        <div class="text-center py-6 text-gray-500">
          No recent posts available.
        </div>
      `;
      return;
    }

    // Get opened and dismissed posts from localStorage
    const openedPosts = JSON.parse(localStorage.getItem("openedPosts") || "[]");
    const dismissedPosts = JSON.parse(localStorage.getItem("dismissedPosts") || "[]");

    container.innerHTML = `
      <div class="space-y-4">
        ${posts
          .filter(post => !dismissedPosts.includes(post.id)) // Remove dismissed posts
          .map(post => {
            const isOpened = openedPosts.includes(post.id);
            return `
              <div class="bg-white rounded-2xl shadow overflow-hidden hover:shadow-lg transition relative" data-id="${post.id}">
                
                <!-- Gradient Header -->
                <div class="px-5 py-3 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white font-semibold text-lg flex items-center justify-between">
                  
                  <div class="flex items-center gap-2">
                    <i class="fa-solid fa-newspaper"></i>
                    <span>Recent Post</span>
                  </div>
                  
                  <div class="flex items-center gap-2">
                    ${!isOpened ? `<span class="bg-white text-green-600 text-xs font-bold px-2 py-1 rounded-full">NEW</span>` : ""}
                    <button class="ml-2 text-white hover:text-gray-200 focus:outline-none dismiss-btn">&times;</button>
                  </div>
                </div>

                <!-- Post Content -->
                <a href="/tamilgeo/post.html?id=${post.id}" class="block px-5 py-4 hover:bg-gray-50 transition open-post" data-id="${post.id}">
                  <h3 class="text-lg font-semibold text-green-600 mb-2 truncate">${post.title}</h3>
                  <p class="text-sm text-gray-500">${post.date}</p>
                </a>
              </div>
            `;
          }).join("")}
      </div>
    `;

    // Dismiss button functionality
    document.querySelectorAll(".dismiss-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent link click
        const card = e.target.closest("[data-id]");
        const postId = parseInt(card.getAttribute("data-id"));

        // Remove from DOM
        card.remove();

        // Save dismissed state
        let dismissedPosts = JSON.parse(localStorage.getItem("dismissedPosts") || "[]");
        if (!dismissedPosts.includes(postId)) {
          dismissedPosts.push(postId);
          localStorage.setItem("dismissedPosts", JSON.stringify(dismissedPosts));
        }
      });
    });

    // Mark post as opened when clicked
    document.querySelectorAll(".open-post").forEach(link => {
      link.addEventListener("click", () => {
        const postId = parseInt(link.getAttribute("data-id"));

        let openedPosts = JSON.parse(localStorage.getItem("openedPosts") || "[]");
        if (!openedPosts.includes(postId)) {
          openedPosts.push(postId);
          localStorage.setItem("openedPosts", JSON.stringify(openedPosts));
        }
      });
    });
  });
});

/**
 * Fetch the 10 most recent posts from WordPress.com API
 */
async function fetchRecentPosts() {
  const apiURL = "https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts?per_page=10&_embed";
  console.log("Fetching posts from:", apiURL);

  try {
    const response = await fetch(apiURL);
    console.log("Response status:", response.status);

    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

    const posts = await response.json();
    console.log("Posts fetched:", posts);

    return posts.map(post => ({
      id: post.id,
      title: post.title.rendered,
      date: new Date(post.date).toLocaleDateString(),
      timestamp: new Date(post.date).getTime()
    }));
  } catch (error) {
    console.error("Error fetching posts:", error);
    return []; // Return empty array on error
  }
}