import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase, ref, get, set, update, remove, push } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDt86oFFa-h04TsfMWSFGe3UHw26WYoR-U",
  authDomain: "tamilgeoapp.firebaseapp.com",
  databaseURL: "https://tamilgeoapp-default-rtdb.firebaseio.com",
  projectId: "tamilgeoapp",
  storageBucket: "tamilgeoapp.appspot.com",
  messagingSenderId: "1092623024431",
  appId: "1:1092623024431:web:ea455dd68a9fcf480be1da"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// DOM
const postsTable = document.getElementById("posts-table");
const modal = document.getElementById("post-modal");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-description");
const approveBtn = document.getElementById("approve-btn");
const rejectBtn = document.getElementById("reject-btn");
const editBtn = document.getElementById("edit-btn");
const closeModal = document.getElementById("close-modal");

let selectedPostId = null;
let selectedPost = null;

// Auth check
onAuthStateChanged(auth, user => {
  if (!user) {
    alert("Please log in as admin to access admin panel.");
    window.location.href = "login.html";
    return;
  }
  loadPosts();
});

// Load Posts
async function loadPosts() {
  const snapshot = await get(ref(db, "posts"));
  const posts = snapshot.val() || {};
  postsTable.innerHTML = "";

  Object.keys(posts).forEach(id => {
    const post = posts[id];
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="p-2">${post.title}</td>
      <td class="p-2">${post.description?.substring(0,50) || ""}...</td>
      <td class="p-2">
        ${post.approved ? 
          '<span class="text-green-400">Approved</span>' : 
          '<span class="text-yellow-400">Pending</span>'}
      </td>
      <td class="p-2">
        <button class="view-post bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-white" data-id="${id}">
          <i class="fa-solid fa-eye"></i> View
        </button>
      </td>
    `;
    postsTable.appendChild(row);
  });

  document.querySelectorAll(".view-post").forEach(btn => {
    btn.addEventListener("click", e => {
      selectedPostId = e.target.closest("button").dataset.id;
      selectedPost = posts[selectedPostId];
      openPostModal(selectedPost);
    });
  });
}

// Open Modal
function openPostModal(post) {
  modalTitle.textContent = post.title;
  modalDesc.textContent = post.description;
  modal.classList.remove("hidden");
}

// Close Modal
closeModal.addEventListener("click", () => modal.classList.add("hidden"));

// ---------------------- Notifications ---------------------- //
async function createNotification({ title, description, message, category, imageUrl, postLink, postId }) {
  const notifRef = push(ref(db, "notifications"));
  const notification = {
    id: notifRef.key,
    title,
    description,
    message,
    category: category || "general",
    imageUrl: imageUrl || "",
    postLink: postLink || "",
    postId: postId || null,
    timestamp: Date.now()
  };
  await set(notifRef, notification);
}
// ----------------------------------------------------------- //

// Approve Post
approveBtn.addEventListener("click", async () => {
  if (!selectedPostId) return;
  try {
    await update(ref(db, `posts/${selectedPostId}`), { approved: true });

    await createNotification({
      title: selectedPost.title,
      description: selectedPost.description,
      message: "A new post has been approved!",
      category: selectedPost.category || "general",
      imageUrl: selectedPost.imageUrl || "",
      postLink: selectedPost.linkUrl || "",
      postId: selectedPostId
    });

    modal.classList.add("hidden");
    loadPosts();
  } catch (err) {
    alert("Failed to approve post: " + err.message);
  }
});

// Reject Post
rejectBtn.addEventListener("click", async () => {
  if (!selectedPostId) return;
  if (!confirm("Reject this post? It will be deleted.")) return;
  try {
    await remove(ref(db, `posts/${selectedPostId}`));

    await createNotification({
      title: "Post Rejected",
      description: selectedPost?.description || "Admin rejected a post.",
      message: "A post was rejected by admin.",
      category: selectedPost?.category || "general",
      imageUrl: selectedPost?.imageUrl || "",
      postLink: "",
      postId: selectedPostId
    });

    modal.classList.add("hidden");
    loadPosts();
  } catch (err) {
    alert("Failed to reject post: " + err.message);
  }
});

// Edit Post
editBtn.addEventListener("click", async () => {
  if (!selectedPostId) return;
  const newTitle = prompt("Edit Title:", modalTitle.textContent);
  const newDesc = prompt("Edit Description:", modalDesc.textContent);
  if (newTitle && newDesc) {
    try {
      await update(ref(db, `posts/${selectedPostId}`), { title: newTitle, description: newDesc });

      await createNotification({
        title: newTitle,
        description: newDesc,
        message: "A post was edited by admin.",
        category: selectedPost?.category || "general",
        imageUrl: selectedPost?.imageUrl || "",
        postLink: selectedPost?.linkUrl || "",
        postId: selectedPostId
      });

      modal.classList.add("hidden");
      loadPosts();
    } catch (err) {
      alert("Failed to edit post: " + err.message);
    }
  }
});