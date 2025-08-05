// views.js

function incrementViewCount(postId) {
  const viewRef = db.ref("views/" + postId);
  viewRef.transaction(current => (current || 0) + 1);
}

function showViewCount(postId, containerId) {
  const viewRef = db.ref("views/" + postId);
  const container = document.getElementById(containerId);

  viewRef.once("value").then(snapshot => {
    const count = snapshot.val() || 0;
    container.innerHTML = `<div style="margin-top: 0.5rem; font-size: 0.85rem; color: #555;">👁️ ${count} views</div>`;
  });
}