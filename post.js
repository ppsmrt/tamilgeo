// Load and display individual post from localStorage
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
}

document.addEventListener("DOMContentLoaded", () => {
  const postData = JSON.parse(localStorage.getItem("postData"));
  const postContainer = document.getElementById("post");

  if (!postData) {
    postContainer.innerHTML = "<p>Post not found.</p>";
    return;
  }

  const imageUrl = postData._embedded?.['wp:featuredmedia']?.[0]?.source_url || "";
  const author = postData._embedded?.author?.[0]?.name || "Unknown";
  const date = formatDate(postData.date);
  const content = postData.content.rendered;

  postContainer.innerHTML = `
    <div class="post-full">
      ${imageUrl ? `<img src="${imageUrl}" alt="Featured Image" class="post-full-img" loading="lazy">` : ""}
      <h1>${postData.title.rendered}</h1>
      <div class="post-meta">By ${author} | ${date}</div>
      <div class="post-body">${content}</div>
    </div>
  `;

  // Optional: Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
});