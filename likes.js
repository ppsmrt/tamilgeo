// likes.js

function setupLikeButton(postId, containerId) {
  const likeRef = db.ref("likes/" + postId);
  const container = document.getElementById(containerId);

  likeRef.once("value").then(snapshot => {
    let likeCount = snapshot.val() || 0;
    renderLikeButton(container, likeCount, postId);
  });
}

function renderLikeButton(container, count, postId) {
  container.innerHTML = `
    <button id="like-btn" style="margin-top: 1rem; font-size: 1rem; padding: 0.5rem 1rem; border-radius: 8px; background-color: #002f6c; color: white; border: none; cursor: pointer;">
      ❤️ Like (<span id="like-count">${count}</span>)
    </button>
  `;

  document.getElementById("like-btn").addEventListener("click", () => {
    const likeRef = db.ref("likes/" + postId);
    likeRef.transaction(current => (current || 0) + 1);
    const countElem = document.getElementById("like-count");
    countElem.textContent = parseInt(countElem.textContent) + 1;
  });
}