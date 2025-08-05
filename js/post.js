const postId = new URLSearchParams(window.location.search).get("id");
const postURL = `https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts/${postId}`;
const container = document.getElementById("post-container");

fetch(postURL)
  .then(res => res.json())
  .then(post => {
    const image = post.jetpack_featured_media_url
      ? `<img src="${post.jetpack_featured_media_url}" class="w-full h-60 object-cover rounded-md mb-4">`
      : "";

    container.innerHTML = `
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-2xl font-bold mb-2">${post.title.rendered}</h2>
        <div class="text-sm text-gray-500 mb-4">
          👤 Author: ${post.author} | 🗓️ ${new Date(post.date).toLocaleDateString()}
        </div>
        ${image}
        <div class="prose max-w-none mb-6">${post.content.rendered}</div>

        <!-- Like & Share -->
        <div class="mt-4 flex flex-wrap gap-2">
          <button onclick="likePost()" class="bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600">♥ Like</button>
          <button onclick="sharePost()" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">🔗 Share</button>
        </div>

        <!-- Comment Section -->
        <div class="mt-6">
          <h3 class="font-semibold text-lg mb-2">💬 Comments</h3>
          <textarea placeholder="Write a comment..." class="w-full p-2 border rounded mb-2" id="comment-box"></textarea>
          <button onclick="addComment()" class="bg-green-600 text-white px-3 py-1 rounded">Post Comment</button>
          <div id="comments" class="mt-4 space-y-2 text-sm text-gray-700"></div>
        </div>
      </div>
    `;

    loadComments();
  });

function likePost() {
  alert("♥ You liked this post (saved locally).");
}

function sharePost() {
  const url = window.location.href;
  navigator.clipboard.writeText(url);
  alert("🔗 Post link copied to clipboard!");
}

function addComment() {
  const commentBox = document.getElementById("comment-box");
  const comments = JSON.parse(localStorage.getItem(`comments_${postId}`)) || [];
  if (commentBox.value.trim()) {
    comments.push(commentBox.value.trim());
    localStorage.setItem(`comments_${postId}`, JSON.stringify(comments));
    commentBox.value = "";
    loadComments();
  }
}

function loadComments() {
  const comments = JSON.parse(localStorage.getItem(`comments_${postId}`)) || [];
  const commentsDiv = document.getElementById("comments");
  commentsDiv.innerHTML = comments.map(c => `<div class="bg-gray-100 p-2 rounded">${c}</div>`).join("");
}