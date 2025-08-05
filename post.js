// post.js
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
}

window.addEventListener("DOMContentLoaded", () => {
  const postData = JSON.parse(localStorage.getItem("postData"));
  const postContainer = document.getElementById("post-content");

  if (!postData) {
    postContainer.innerHTML = "<p style='color:red;'>Post not found.</p>";
    return;
  }

  const imageUrl = postData._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  postContainer.innerHTML = `
    ${imageUrl ? `<img src="${imageUrl}" style="width:100%;border-radius:12px;" alt="Featured" />` : ""}
    <h2>${postData.title.rendered}</h2>
    <p><strong>${postData._embedded.author[0].name}</strong> | ${formatDate(postData.date)}</p>
    <div>${postData.content.rendered}</div>
  `;
});
