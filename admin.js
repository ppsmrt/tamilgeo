// admin.js import { db } from './firebase-init.js'; import { collection, getDocs, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore-lite.js";

const postsTable = document.getElementById('posts-table-body');

// Fetch submitted posts from Firestore async function fetchSubmittedPosts() { const postsSnapshot = await getDocs(collection(db, 'submitted_posts')); postsTable.innerHTML = '';

postsSnapshot.forEach(docSnap => { const post = docSnap.data(); const tr = document.createElement('tr'); tr.innerHTML = <td>${post.title}</td> <td>${post.author}</td> <td>${new Date(post.date).toLocaleDateString()}</td> <td> <button onclick="approvePost('${docSnap.id}')">Approve</button> <button onclick="rejectPost('${docSnap.id}')">Reject</button> </td>; postsTable.appendChild(tr); }); }

// Approve post async function approvePost(id) { const docRef = doc(db, 'submitted_posts', id); const docSnap = await getDoc(docRef); const post = docSnap.data();

await setDoc(doc(db, 'approved_posts', id), post); await deleteDoc(docRef); fetchSubmittedPosts(); }

// Reject (delete) post async function rejectPost(id) { await deleteDoc(doc(db, 'submitted_posts', id)); fetchSubmittedPosts(); }

// Call initial fetch fetchSubmittedPosts();

