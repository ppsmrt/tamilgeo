const postContainer = document.getElementById("posts");
let allPosts = [];

function renderPost(post, source) {
  const div = document.createElement("div");
  div.className = "post-card";
  div.innerHTML = `
    <h2>${post.title}</h2>
    <p>${post.content?.substring(0, 120) || post.excerpt || ""}...</p>
    <div class="meta">
      <span>${post.author || "Unknown"}</span>
      <span>${post.date}</span>
    </div>
    ${source === "wordpress" ? `<button onclick="location.href='post.html?id=${post.ID}'">Read More</button>` : ""}
  `;
  div.dataset.source = source;
  postContainer.appendChild(div);
}

function renderAll() {
  postContainer.innerHTML = "";
  allPosts.forEach(p => renderPost(p, p.source));
}

function filterPosts(source) {
  const cards = document.querySelectorAll(".post-card");
  cards.forEach(card => {
    if (source === "all" || card.dataset.source === source) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

function loadPosts() {
  fetch("https://public-api.wordpress.com/rest/v1.1/sites/tamilgeo.wordpress.com/posts/")
    .then(res => res.json())
    .then(data => {
      const wpPosts = data.posts.map(p => ({
        ID: p.ID,
        title: p.title,
        excerpt: p.excerpt,
        date: new Date(p.date).toLocaleDateString(),
        author: p.author?.name || "TamilGeo",
        source: "wordpress"
      }));
      allPosts = [...allPosts, ...wpPosts];
      renderAll();
    });

  const userPosts = JSON.parse(localStorage.getItem("customPosts") || "[]");
  const formatted = userPosts.map(p => ({
    title: p.title,
    content: p.content,
    date: p.date,
    author: p.author,
    source: "user"
  }));
  allPosts = [...formatted];
}

document.getElementById("search").addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();
  const cards = document.querySelectorAll(".post-card");
  cards.forEach(card => {
    const title = card.querySelector("h2").textContent.toLowerCase();
    card.style.display = title.includes(value) ? "block" : "none";
  });
});

loadPosts();