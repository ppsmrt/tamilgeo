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

    // Filter out dismissed posts
    const filteredPosts = posts.filter(post => !dismissedPosts.includes(post.id));

    if (filteredPosts.length === 0) {
      container.innerHTML = `<div class="text-center py-6 text-gray-500">No notifications available.</div>`;
      return;
    }

    // Build grouped card
    container.innerHTML = `
      <div class="bg-white rounded-2xl shadow overflow-hidden max-w-xl mx-auto">
        
        <!-- Gradient Heading -->
        <div class="px-5 py-4 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white font-semibold text-lg flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-bell"></i>
            Notifications
          </div>
          <button class="text-white hover:text-gray-200 focus:outline-none dismiss-all-btn">&times;</button>
        </div>

        <!-- Notifications List -->
        <div class="divide-y">
          ${filteredPosts.map(post => {
            const isOpened = openedPosts.includes(post.id);
            const daysAgo = getDaysAgo(post.timestamp);
            return `
              <a href="/tamilgeo/post.html?id=${post.id}" class="block px-5 py-4 hover:bg-gray-50 transition open-post" data-id="${post.id}">
                <h3 class="text-lg font-semibold text-green-600 mb-1 truncate">${post.title}</h3>
                <div class="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  ${!isOpened ? `<span class="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">NEW</span>` : ""}
                  <span>By ${post.author}</span>
                  <span>|</span>
                  <span>${post.category}</span>
                  <span>|</span>
                  <span>${daysAgo} ago</span>
                </div>
              </a>
            `;
          }).join("")}
        </div>
      </div>
    `;

    // Handle dismiss-all button
    document.querySelector(".dismiss-all-btn").addEventListener("click", () => {
      // Animate fade-out then clear container
      const card = document.querySelector(".bg-white.rounded-2xl");
      card.classList.add("opacity-0", "transition", "duration-300");
      setTimeout(() => (container.innerHTML = `<div class="text-center py-6 text-gray-500">All notifications dismissed.</div>`), 300);

      // Save dismissed posts
      let dismissedPosts = JSON.parse(localStorage.getItem("dismissedPosts") || "[]");
      filteredPosts.forEach(post => {
        if (!dismissedPosts.includes(post.id)) {
          dismissedPosts.push(post.id);
        }
      });
      localStorage.setItem("dismissedPosts", JSON.stringify(dismissedPosts));
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

  try {
    const response = await fetch(apiURL);
    if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

    const posts = await response.json();

    return posts.map(post => {
      const author = post._embedded.author ? post._embedded.author[0].name : "Unknown";
      const category = post._embedded["wp:term"] && post._embedded["wp:term"][0].length > 0
        ? post._embedded["wp:term"][0][0].name
        : "Uncategorized";

      return {
        id: post.id,
        title: post.title.rendered,
        author: author,
        category: category,
        timestamp: new Date(post.date).getTime()
      };
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return []; // Return empty array on error
  }
}

/**
 * Calculate days ago from timestamp
 */
function getDaysAgo(timestamp) {
  const now = new Date().getTime();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  return `${days} days`;
}