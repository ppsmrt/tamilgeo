// comments.js

function loadComments(postId, containerId) {
  const commentRef = db.ref("comments/" + postId);
  const container = document.getElementById(containerId);

  commentRef.on("value", snapshot => {
    container.innerHTML = "";
    snapshot.forEach(child => {
      const data = child.val();
      const commentElement = document.createElement("div");
      commentElement.className = "comment-item";
      commentElement.innerHTML = `
        <p><strong>${data.name}</strong> <small>${data.time}</small></p>
        <p>${data.message}</p>
        <hr/>
      `;
      container.appendChild(commentElement);
    });
  });
}

function submitComment(postId) {
  const name = document.getElementById("commentName").value.trim();
  const message = document.getElementById("commentText").value.trim();

  if (!name || !message) {
    alert("Please fill out both name and comment.");
    return;
  }

  const commentRef = db.ref("comments/" + postId);
  const commentData = {
    name,
    message,
    time: new Date().toLocaleString()
  };

  commentRef.push(commentData);
  document.getElementById("commentName").value = "";
  document.getElementById("commentText").value = "";
}