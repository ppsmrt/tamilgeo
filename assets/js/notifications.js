document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("notifications-container");

  if (!container) {
    console.error("Container element not found: #notifications-container");
    return;
  }

  // Loading state
  container.innerHTML = `
    <div class="p-6 text-center text-gray-500 animate-pulse">Loading notifications...</div>
  `;

  fetchRecentPosts().then(posts => {
    if (!posts.length) {
      container.innerHTML = `
        <div class="p-6 text-center text-gray-500">No notifications available</div>
      `;
      return;
    }

    // Limit to 5 posts
    posts = posts.slice(0, 5);

    // Get opened/dismissed posts from localStorage
    const openedPosts = JSON.parse(localStorage.getItem("openedPosts") || "[]");
    const dismissedPosts = JSON.parse(localStorage.getItem("dismissedPosts") || "[]");

    const filteredPosts = posts.filter(post => !dismissedPosts.includes(post.id));

    if (!filteredPosts.length) {
      container.innerHTML = `<div class="p-6 text-center text-gray-500">No notifications available</div>`;
      return;
    }

    // Inject card structure
    container.innerHTML = `
      <div class="w-full">
        <!-- Gradient Heading -->
        <div class="px-5 py-4 bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white font-semibold text-lg flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i class="fa-solid fa-bell"></i>
            Notifications
          </div>
          <button class="text-white hover:text-gray-200 focus:outline-none dismiss-all-btn">&times;</button>
        </div>

        <!-- Notifications List -->
        <div class="divide-y divide-gray-100">
          ${filteredPosts.map(post => {
            const isOpened = openedPosts.includes(post.id);
            const daysAgo = getDaysAgo(post.timestamp);
            return `
              <a href="/tamilgeo/post.html?id=${post.id}" class="block w-full px-5 py-4 hover:bg-gray-50 transition open-post" data-id="${post.id}">
                <div class="flex items-center justify-between">
                  <h3 class="text-base font-medium text-gray-900 truncate">${post.title}</h3>
                  ${!isOpened ? `<span class="bg-red-500 text-white text-xs px-2 py-1 rounded-full">NEW</span>` : ""}
                </div>
                <div class="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-500">
                  <span>By ${post.author}</span>
                  <span>|</span>
                  <span>${post.category}</span>
                  <span>|</span>
                  <span>${daysAgo}</span>
                </div>
              </a>
            `;
          }).join("")}
        </div>
      </div>
    `;

    // Feather icons
    if (window.feather) feather.replace();

    // Dismiss all button
    document.querySelector(".dismiss-all-btn").addEventListener("click", () => {
      filteredPosts.forEach(post => {
        if (!dismissedPosts.includes(post.id)) dismissedPosts.push(post.id);
      });
      localStorage.setItem("dismissedPosts", JSON.stringify(dismissedPosts));
      container.innerHTML = `<div class="p-6 text-center text-gray-500">All notifications dismissed.</div>`;
    });

    // Mark post as opened
    document.querySelectorAll(".open-post").forEach(link => {
      link.addEventListener("click", () => {
        const postId = parseInt(link.getAttribute("data-id"));
        if (!openedPosts.includes(postId)) {
          openedPosts.push(postId);
          localStorage.setItem("openedPosts", JSON.stringify(openedPosts));
        }
      });
    });
  });
});

/**
 * Fetch posts from WordPress
 */
async function fetchRecentPosts() {
  const apiURL = "https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts?per_page=10&_embed";
  try {
    const response = await fetch(apiURL);
    if (!response.ok) throw new Error("Failed to fetch posts");

    const posts = await response.json();
    return posts.map(post => {
      const author = post._embedded?.author ? post._embedded.author[0].name : "Unknown";
      const category = post._embedded?.["wp:term"]?.[0]?.[0]?.name || "Uncategorized";
      return {
        id: post.id,
        title: post.title.rendered,
        author,
        category,
        timestamp: new Date(post.date).getTime()
      };
    });
  } catch (err) {
    console.error(err);
    return [];
  }
}

/**
 * Calculate days ago
 */
function getDaysAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "1 day";
  return `${days} days`;
}