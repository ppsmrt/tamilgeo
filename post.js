document.addEventListener("DOMContentLoaded", () => {
  const postData = JSON.parse(localStorage.getItem("postData"));
  if (!postData) return;

  const postContainer = document.getElementById("post");
  const recommendedContainer = document.getElementById("recommended-posts");

  const authorName = postData._embedded?.author?.[0]?.name || "Unknown Author";
  const featuredImage = postData._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
  const postDate = new Date(postData.date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const postHtml = `
    <div class="post-card">
      ${featuredImage ? `
        <div class="post-image-wrapper">
          <img src="${featuredImage}" alt="Featured image" />
        </div>` : ''}
      <div class="post-content">
        <h1>${postData.title.rendered}</h1>
        <div class="post-meta">
          <span>${authorName}</span> |
          <span>${postDate}</span>
        </div>
        <div class="post-body">${postData.content.rendered}</div>
        <div class="engagement">
          <button id="like-btn">👍 Like <span id="like-count">0</span></button>
          <span id="view-count">👁️ 0 views</span>
        </div>
        <div id="comments-section">
          <h3>Comments</h3>
          <div id="comments-list">Loading comments...</div>
          <textarea id="comment-input" placeholder="Write a comment..."></textarea>
          <button id="submit-comment">Post Comment</button>
        </div>
      </div>
    </div>
  `;

  postContainer.innerHTML = postHtml;

  // Firebase Integration for views, likes, and comments
  const firebasePostId = `post-${postData.id}`;
  const db = firebase.database();
  const likesRef = db.ref(`likes/${firebasePostId}`);
  const viewsRef = db.ref(`views/${firebasePostId}`);
  const commentsRef = db.ref(`comments/${firebasePostId}`);

  // Increment view count
  viewsRef.transaction(current => (current || 0) + 1);

  // Load like count
  likesRef.on("value", snapshot => {
    document.getElementById("like-count").textContent = snapshot.val() || 0;
  });

  // Like button click
  document.getElementById("like-btn").addEventListener("click", () => {
    likesRef.transaction(current => (current || 0) + 1);
  });

  // Load view count
  viewsRef.on("value", snapshot => {
    document.getElementById("view-count").textContent = `👁️ ${snapshot.val() || 0} views`;
  });

  // Load comments
  commentsRef.on("value", snapshot => {
    const commentsList = document.getElementById("comments-list");
    const comments = snapshot.val() || {};
    commentsList.innerHTML = Object.values(comments)
      .map(comment => `<div class="comment"><strong>${comment.name}</strong>: ${comment.text}</div>`)
      .join("");
  });

  // Post a comment
  document.getElementById("submit-comment").addEventListener("click", () => {
    const commentInput = document.getElementById("comment-input");
    const commentText = commentInput.value.trim();
    if (commentText === "") return;

    const newCommentRef = commentsRef.push();
    newCommentRef.set({
      name: "Anonymous", // You can replace this with a real user system
      text: commentText,
    });

    commentInput.value = "";
  });

  // Load Recommended Posts
  fetch("https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts?_embed&per_page=3")
    .then(res => res.json())
    .then(posts => {
      recommendedContainer.innerHTML = "<h3>Recommended Posts</h3>";
      posts
        .filter(p => p.id !== postData.id)
        .forEach(p => {
          const img = p._embedded?.['wp:featuredmedia']?.[0]?.source_url || '';
          const title = p.title.rendered;
          const card = document.createElement("div");
          card.className = "recommended-card";
          card.innerHTML = `
            ${img ? `<img src="${img}" alt="${title}" />` : ""}
            <h4>${title}</h4>
          `;
          card.addEventListener("click", () => {
            localStorage.setItem("postData", JSON.stringify(p));
            window.location.href = "post.html";
          });
          recommendedContainer.appendChild(card);
        });
    });
});