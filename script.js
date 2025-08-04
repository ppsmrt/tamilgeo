const API_URL = "https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts?_embed";

async function loadPosts() {
  const container = document.getElementById("posts");
  container.innerHTML = "<p>Loading posts...</p>";

  try {
    const res = await fetch(API_URL);
    const posts = await res.json();

    container.innerHTML = "";

    posts.forEach(post => {
      const title = post.title.rendered;
      const excerpt = post.excerpt.rendered.replace(/<[^>]+>/g, "").slice(0, 150) + "...";
      const link = post.link;

      let imageUrl = "https://via.placeholder.com/600x300?text=No+Image";
      if (
        post._embedded &&
        post._embedded['wp:featuredmedia'] &&
        post._embedded['wp:featuredmedia'][0] &&
        post._embedded['wp:featuredmedia'][0].source_url
      ) {
        imageUrl = post._embedded['wp:featuredmedia'][0].source_url;
      }

      const categoryNames = post._embedded['wp:term']?.[0]?.map(cat => cat.name).join(", ") || "Uncategorized";

      const card = document.createElement("div");
      card.className = "post-card";
      card.innerHTML = `
        <img src="${imageUrl}" alt="Post Image" loading="lazy" />
        <h2>${title}</h2>
        <p>${excerpt}</p>
        <span class="post-category">${categoryNames}</span>
      `;

      card.addEventListener("click", () => window.open(link, "_blank"));
      container.appendChild(card);
    });

  } catch (error) {
    console.error("Error loading posts:", error);
    container.innerHTML = "<p>Unable to load posts at the moment.</p>";
  }
}

loadPosts();