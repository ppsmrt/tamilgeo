document.addEventListener("DOMContentLoaded", () => {
  const postData = JSON.parse(localStorage.getItem("postData"));
  const postContainer = document.getElementById("post-content");

  if (!postData) {
    postContainer.innerHTML = "<p>Unable to load the post.</p>";
    return;
  }

  // Display post content
  const postHtml = `
    <div class="post-card">
      <div class="post-image-wrapper">
        ${postData._embedded?.['wp:featuredmedia']?.[0]?.source_url 
          ? `<img src="${postData._embedded['wp:featuredmedia'][0].source_url}" alt="Featured" />`
          : ""}
      </div>
      <div class="post-content">
        <h1>${postData.title.rendered}</h1>
        <div class="post-meta">
          ${postData._embedded.author[0].name} |
          ${new Date(postData.date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </div>
        <div class="post-body">${postData.content.rendered}</div>
      </div>
    </div>
  `;

  postContainer.insertAdjacentHTML("afterbegin", postHtml);

  // Load Recommended Posts
  loadRecommended(postData.id);
});

// Load recommended posts
async function loadRecommended(currentPostId) {
  try {
    const res = await fetch("https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts?_embed&per_page=3");
    const posts = await res.json();
    const recContainer = document.getElementById("recommended");

    posts
      .filter(post => post.id !== currentPostId)
      .forEach(post => {
        const card = document.createElement("div");
        card.className = "post-card mini";
        card.innerHTML = `
          <div class="post-content">
            <h3>${post.title.rendered}</h3>
            <div class="post-meta">${post._embedded.author[0].name}</div>
          </div>
        `;
        card.onclick = () => {
          localStorage.setItem("postData", JSON.stringify(post));
          window.location.href = "post.html";
        };
        recContainer.appendChild(card);
      });
  } catch (error) {
    console.error("Error loading recommended posts:", error);
  }
}