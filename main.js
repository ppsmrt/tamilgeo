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
  const container = document.getElementById("posts");
  try {
    const response = await fetch("https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts?_embed");
    if (!response.ok) throw new Error("Network error");
    const posts = await response.json();

    container.innerHTML = "";
    posts.forEach(post => {
      const card = document.createElement("div");
      card.className = "post-card";

      // Lazy image loading
      let imageUrl = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
      let category = post._embedded['wp:term']?.[0]?.[0]?.name || "";

      card.onclick = () => {
        localStorage.setItem("postData", JSON.stringify(post));
        window.location.href = "post.html";
      };

      card.innerHTML = `
        <div class="post-image-wrapper">
          ${imageUrl ? `<img src="${imageUrl}" alt="Featured" loading="lazy" />` : ""}
        </div>
        <div class="post-content">
          <h2>${post.title.rendered}</h2>
          <div class="post-excerpt">${getExcerpt(post.excerpt.rendered)}</div>
          <div class="post-category">${category}</div>
          <div class="post-meta">
            ${post._embedded.author[0].name} | ${formatDate(post.date)}
          </div>
        </div>
      `;

      container.appendChild(card);
    });

    // Fade-in animation on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
        }
      });
    });

    document.querySelectorAll('.post-card').forEach(card => {
      observer.observe(card);
    });

  } catch (err) {
    container.innerHTML = '<p>Failed to load posts. Try again later.</p>';
  }
}

// Search functionality
document.getElementById("search").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  document.querySelectorAll(".post-card").forEach(card => {
    const title = card.querySelector("h2").textContent.toLowerCase();
    card.style.display = title.includes(query) ? "" : "none";
  });
});

// Load posts on page load
loadPosts();