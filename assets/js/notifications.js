// notifications.js
const notificationsContainer = document.getElementById("notificationsContainer");
const emptyState = document.getElementById("emptyState");

// Helper to get seen posts from localStorage
function getSeenPosts() {
  return JSON.parse(localStorage.getItem("seenPosts") || "{}");
}

// Helper to mark a post as seen
function markPostSeen(postId) {
  const seenPosts = getSeenPosts();
  seenPosts[postId] = true;
  localStorage.setItem("seenPosts", JSON.stringify(seenPosts));
}

// Fetch recent 10 posts from WordPress
async function fetchRecentPosts() {
  try {
    const response = await fetch("https://tamilgeo.wordpress.com/wp-json/wp/v2/posts?per_page=10&_embed");
    const posts = await response.json();
    return posts.map(post => ({
      id: post.id,
      title: post.title.rendered,
      date: new Date(post.date).toLocaleDateString(),
      timestamp: new Date(post.date).getTime()
    }));
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

// Render notifications
function renderNotifications(posts) {
  notificationsContainer.innerHTML = "";
  const seenPosts = getSeenPosts();

  if (!posts || posts.length === 0) {
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  posts.forEach((post, index) => {
    const card = document.createElement("div");
    card.className = "notification-card relative bg-white p-4 rounded-lg mb-3 shadow cursor-pointer hover:bg-green-50 transition";

    const isNew = !seenPosts[post.id];

    card.innerHTML = `
      <h2 class="text-lg font-semibold flex justify-between items-center">
        <span>${post.title}</span>
        ${isNew ? `<span class="ml-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">New</span>` : ''}
      </h2>
      <p class="text-gray-500 text-sm mt-1">${post.date}</p>
    `;

    notificationsContainer.appendChild(card);

    // Open internal post page and mark as seen
    card.addEventListener("click", () => {
      markPostSeen(post.id);
      // Re-render to remove badge immediately
      renderNotifications(posts);
      window.location.href = `post.html?PostID=${post.id}`;
    });

    // Divider
    if (index < posts.length - 1) {
      const divider = document.createElement("div");
      divider.className = "h-1 my-2 rounded bg-gradient-to-r from-green-400 to-green-600";
      notificationsContainer.appendChild(divider);
    }
  });
}

// Initialize and auto-refresh every 5 minutes
async function initNotifications() {
  const posts = await fetchRecentPosts();
  renderNotifications(posts);
}

// Run once immediately
initNotifications();

// Refresh every 5 minutes (300,000 ms)
setInterval(initNotifications, 300000);