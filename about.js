const blogURL = "https://public-api.wordpress.com/wp/v2/sites/tamilgeo.wordpress.com";
const container = document.getElementById("about-container");

fetch(`${blogURL}/pages`)
  .then(res => res.json())
  .then(pages => {
    const aboutPage = pages.find(page => 
      page.slug === "about" || page.title.rendered.toLowerCase().includes("about")
    );

    if (aboutPage) {
      container.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">${aboutPage.title.rendered}</h2>
        <div class="prose max-w-none">${aboutPage.content.rendered}</div>
      `;
    } else {
      container.innerHTML = `<p class="text-gray-600">About page not found.</p>`;
    }
  })
  .catch(error => {
    console.error("Error loading About page:", error);
    container.innerHTML = `<p class="text-red-600">Failed to load content.</p>`;
  });