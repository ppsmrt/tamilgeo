// post.js

document.addEventListener("DOMContentLoaded", () => {
  const postData = JSON.parse(localStorage.getItem("postData"));
  if (!postData) return;

  const postContainer = document.getElementById("postContainer");
  const title = document.createElement("h1");
  title.textContent = postData.title.rendered;

  const imageWrapper = document.createElement("div");
  imageWrapper.className = "post-featured";

  const featuredImg = postData._embedded?.['wp:featuredmedia']?.[0]?.source_url;
  if (featuredImg) {
    const img = document.createElement("img");
    img.src = featuredImg;
    img.alt = "Featured Image";
    img.style.maxWidth = "100%";
    img.style.borderRadius = "8px";
    imageWrapper.appendChild(img);
  }

  const meta = document.createElement("div");
  meta.className = "post-meta";
  const author = postData._embedded?.author?.[0]?.name || "TamilGeo";
  const date = new Date(postData.date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  meta.textContent = `${author} | ${date}`;

  const content = document.createElement("div");
  content.className = "post-content";
  content.innerHTML = postData.content.rendered;

  postContainer.appendChild(title);
  postContainer.appendChild(imageWrapper);
  postContainer.appendChild(meta);
  postContainer.appendChild(content);

  // ✅ Integrate Likes & Views
  const postId = postData.id;
  setupLikes(postId, postContainer);
  displayViews(postId, postContainer);
  recordView(postId);

  // ✅ Load comments section
  loadComments(postId);
});