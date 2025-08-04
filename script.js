function renderCustomPosts() {
  const customPosts = JSON.parse(localStorage.getItem("customPosts") || "[]");
  customPosts.forEach(post => {
    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
      <h2>${post.title}</h2>
      <p>${post.content.substring(0, 100)}...</p>
      <p><small>By ${post.author} on ${post.date}</small></p>
    `;
    postContainer.appendChild(div);
  });
}

const postContainer = document.getElementById("posts");

fetch("https://public-api.wordpress.com/rest/v1.1/sites/tamilgeo.wordpress.com/posts/")
  .then(res => res.json())
  .then(data => {
    data.posts.forEach(post => {
      const div = document.createElement("div");
      div.className = "post";
      div.innerHTML = `
        <h2>${post.title}</h2>
        <p>${post.excerpt}</p>
        <button onclick="location.href='post.html?id=${post.ID}'">Read More</button>
      `;
      postContainer.appendChild(div);
    });
  });

renderCustomPosts();