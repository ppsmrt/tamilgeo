// notifications.js

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

    // Build the list of notifications
    container.innerHTML = `
      <ul class="divide-y divide-gray-200">
        ${posts.map(post => `
          <li class="p-4 hover:bg-gray-50 transition">
            <a href="/tamilgeo/post.html?id=${post.id}" class="block">
              <h3 class="text-lg font-semibold text-green-600">${post.title}</h3>
              <p class="text-sm text-gray-500">${post.date}</p>
            </a>
          </li>
        `).join("")}
      </ul>
    `;
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