// notifications.js (Debug Ready)
const notificationsContainer = document.getElementById("notificationsContainer");
const emptyState = document.getElementById("emptyState");

// Helper to get seen posts from localStorage
function getSeenPosts() {
  try {
    return JSON.parse(localStorage.getItem("seenPosts") || "{}");
  } catch (e) {
    console.error("Error reading seenPosts from localStorage:", e);
    return {};
  }
}

// Helper to mark a post as seen
function markPostSeen(postId) {
  const seenPosts = getSeenPosts();
  seenPosts[postId] = true;
  localStorage.setItem("seenPosts", JSON.stringify(seenPosts));
}

// Fetch recent 10 posts from WordPress
async function fetchRecentPosts() {
  const apiURL = "https://tamilgeo.wordpress.com/wp-json/wp/v2/posts?per_page=10&_embed";
  console.log("Fetching posts from:", apiURL);

  try {
    const response = await fetch(apiURL);
    console.log("API Response Status:", response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const posts = await response.json();
    console.log("Fetched posts:", posts);

    return posts.map(post => ({
      id: post.id,
      title: post.title.rendered,
      date: new Date(post.date).toLocaleDateString(),
      timestamp: new Date(post.date).getTime()
    }));
  } catch (error) {
    console.error("Error fetching posts:", error);
    return null; // return null for fallback
  }
}

// Render notifications
function renderNotifications(posts) {
  notificationsContainer.innerHTML = "";
  const seenPosts = getSeenPosts();

  if (!posts || posts.length === 0) {
    emptyState.classList.remove("hidden");
    console.warn("No posts found or API failed.");
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

    // Click event: mark as seen & go to post page
    card.addEventListener("click", () => {
      markPostSeen(post.id);
      console.log(`Post ${post.id} marked as seen`);
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

  console.log("Notifications rendered successfully");
}

// Initialize and auto-refresh every 5 minutes
async function initNotifications() {
  let posts = await fetchRecentPosts();

  if (!posts) {
    console.warn("API failed. Loading mock data...");
    posts = [
      { id: 1, title: "Sample Notification 1", date: "08/28/2025" },
      { id: 2, title: "Sample Notification 2", date: "08/27/2025" }
    ];
  }

  renderNotifications(posts);
}

// Run once immediately
initNotifications();

// Refresh every 5 minutes (300,000 ms)
setInterval(initNotifications, 300000);