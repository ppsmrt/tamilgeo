const blogURL = "https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts";
const postsContainer = document.getElementById("posts-container");

fetch(blogURL)
  .then(res => res.json())
  .then(posts => {
    posts.forEach(post => {
      const card = document.createElement("div");
      card.className = "bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition duration-300";

      const image = post.jetpack_featured_media_url
        ? `<img src="${post.jetpack_featured_media_url}" class="w-full h-48 object-cover" alt="Post image">`
        : "";

      card.innerHTML = `
        ${image}
        <div class="p-4">
          <h2 class="text-lg font-semibold mb-2">${post.title.rendered}</h2>
          <p class="text-sm text-gray-700 mb-4">${post.excerpt.rendered.replace(/<[^>]+>/g, '').substring(0, 100)}...</p>
          <div class="flex justify-between text-xs text-gray-500">
            <span>👤 ${post.author}</span>
            <span>🗓️ ${new Date(post.date).toLocaleDateString()}</span>
          </div>
          <a href="post.html?id=${post.id}" class="block mt-3 text-blue-500 hover:underline text-sm">Read more</a>
        </div>
      `;

      postsContainer.appendChild(card);
    });
  });