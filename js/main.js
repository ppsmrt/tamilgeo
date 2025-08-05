const blogURL = "https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com/posts";
const container = document.getElementById("posts-container");

fetch(blogURL)
  .then(res => res.json())
  .then(posts => {
    posts.forEach(post => {
      const image = post.jetpack_featured_media_url
        ? `<img src="${post.jetpack_featured_media_url}" class="w-full h-40 object-cover rounded-t-md">`
        : "";

      const postHTML = `
        <a href="post.html?id=${post.id}" class="block bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition duration-300 transform hover:-translate-y-1">
          ${image}
          <div class="p-4">
            <h2 class="text-lg font-bold mb-2">${post.title.rendered}</h2>
            <p class="text-sm text-gray-600 mb-2">${stripHTML(post.excerpt.rendered).slice(0, 100)}...</p>
            <div class="flex justify-between text-xs text-gray-500 mt-4">
              <span>👤 ${post.author}</span>
              <span>🗓️ ${new Date(post.date).toLocaleDateString()}</span>
            </div>
          </div>
        </a>
      `;
      container.innerHTML += postHTML;
    });
  });

function stripHTML(html) {
  let div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}