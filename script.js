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
      const excerpt = post.excerpt.rendered.replace(/<[^>]*>?/gm, "").substring(0, 150) + "...";
      const link = post.link;

      // Get image
      const featuredMedia = post._embedded['wp:featuredmedia'];
      const imageUrl = featuredMedia && featuredMedia[0] && featuredMedia[0].source_url 
        ? featuredMedia[0].source_url 
        : "https://via.placeholder.com/600x300?text=No+Image";

      const card = document.createElement("div");
      card.className = "post-card";
      card.innerHTML = `
        <img src="${imageUrl}" alt="Post Image" loading="lazy" />
        <h2>${title}</h2>
        <p>${excerpt}</p>
      `;
      card.onclick = () => window.open(link, "_blank");

      container.appendChild(card);
    });

  } catch (error) {
    console.error("Failed to fetch posts", error);
    container.innerHTML = "<p>Failed to load posts. Try again later.</p>";
  }
}

loadPosts();