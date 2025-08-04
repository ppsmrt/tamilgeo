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