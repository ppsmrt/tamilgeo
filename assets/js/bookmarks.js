const container = document.getElementById("posts-container");

// ✅ Load bookmarks from localStorage
let bookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");

if (bookmarks.length === 0) {
  container.innerHTML = `<p class="col-span-full text-center text-gray-500">No bookmarks yet.</p>`;
} else {
  displayBookmarks(bookmarks);
}

// ✅ Render all bookmarks
function displayBookmarks(list) {
  container.innerHTML = "";

  list.forEach(post => {
    const image = post.image
      ? `<img src="${post.image}" class="w-full h-40 object-cover rounded-t-md">`
      : `<div class="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500">No Image</div>`;

    const postHTML = `
      <div class="relative group mb-6">
        <!-- Open post in local post.html with id -->
        <a href="post.html?id=${post.id}" class="block bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition duration-300 transform hover:-translate-y-1 card">
          ${image}
          <div class="p-4">
            <h2 class="text-lg font-bold mb-2">${post.title}</h2>
            <div class="flex justify-between text-xs text-gray-500 mt-4">
              <span>📌 Saved</span>
              <button 
                class="remove-btn text-red-500 hover:text-red-700" 
                data-id="${post.id}"
                title="Remove from bookmarks"
              >
                <i class="fas fa-trash"></i> Remove
              </button>
            </div>
          </div>
        </a>
      </div>
    `;
    container.innerHTML += postHTML;
  });

  attachRemoveEvents();
}

// ✅ Remove bookmark
function attachRemoveEvents() {
  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      const id = parseInt(this.dataset.id);

      bookmarks = bookmarks.filter(b => b.id !== id);
      localStorage.setItem("bookmarks", JSON.stringify(bookmarks));

      displayBookmarks(bookmarks);
    });
  });
}