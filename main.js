function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
}

function getExcerpt(html, wordLimit = 60) {
  const text = html.replace(/<[^>]+>/g, '');
  return text.split(" ").slice(0, wordLimit).join(" ") + "...";
}

async function loadPosts() {
  const response = await fetch("https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts?_embed");
  const posts = await response.json();
  const container = document.getElementById("posts");

  posts.forEach(post => {
    const card = document.createElement("div");
    card.className = "post-card";

    const imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url || "";
    const category = post._embedded?.['wp:term']?.[0]?.[0]?.name || "";

    card.onclick = () => {
      localStorage.setItem("postData", JSON.stringify(post));
      window.location.href = "post.html";
    };

    card.innerHTML = `
      <div class="post-image-wrapper">
        ${imageUrl ? `<img src="${imageUrl}" alt="Featured Image">` : ""}
      </div>
      <div class="post-content">
        <h2>${post.title.rendered}</h2>
        <div class="post-excerpt">${getExcerpt(post.excerpt.rendered)}</div>
        <div class="post-meta">
          ${post._embedded.author[0].name} | ${formatDate(post.date)}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

loadPosts();