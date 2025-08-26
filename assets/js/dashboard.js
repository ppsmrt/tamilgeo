// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// DOM references
const usernameEl = document.getElementById("username");
const likesEl = document.getElementById("likesCount");
const commentsEl = document.getElementById("commentsCount");
const pendingEl = document.getElementById("pendingCount");
const approvedEl = document.getElementById("approvedCount");
const publishedEl = document.getElementById("publishedCount");
const reportsEl = document.getElementById("reportsCount");
const pollsContainer = document.getElementById("pollsContainer");
const achievementsContainer = document.getElementById("achievementsContainer");

// Auth listener
onAuthStateChanged(auth, (user) => {
  if (user) {
    const uid = user.uid;

    // Get user stats
    const userRef = ref(db, "users/" + uid);
    onValue(userRef, (snapshot) => {
      const data = snapshot.val() || {};
      usernameEl.textContent = data.name || "User";

      likesEl.textContent = data.stats?.likes || 0;
      commentsEl.textContent = data.stats?.comments || 0;
      pendingEl.textContent = data.stats?.pendingPosts || 0;
      approvedEl.textContent = data.stats?.approvedPosts || 0;
      publishedEl.textContent = data.stats?.publishedPosts || 0;
      reportsEl.textContent = data.stats?.reports || 0;
    });

    // Get polls
    const pollsRef = ref(db, "polls");
    onValue(pollsRef, (snapshot) => {
      pollsContainer.innerHTML = "";
      const polls = snapshot.val() || {};
      Object.entries(polls).forEach(([pollId, poll]) => {
        if (poll.active) {
          const pollCard = document.createElement("div");
          pollCard.className = "bg-white p-4 rounded-xl shadow";
          pollCard.innerHTML = `
            <h3 class="text-lg font-semibold mb-2">${poll.question}</h3>
            <ul>
              ${Object.entries(poll.options)
                .map(([option, count]) => `
                  <li class="flex justify-between border-b py-1">
                    <span>${option}</span>
                    <span class="font-bold">${count}</span>
                  </li>
                `)
                .join("")}
            </ul>
          `;
          pollsContainer.appendChild(pollCard);
        }
      });
    });

    // Get achievements
    const achievementsRef = ref(db, "achievements/" + uid);
    onValue(achievementsRef, (snapshot) => {
      achievementsContainer.innerHTML = "";
      const data = snapshot.val() || {};
      if (data.badges) {
        Object.keys(data.badges).forEach((badge) => {
          if (data.badges[badge]) {
            const badgeCard = document.createElement("div");
            badgeCard.className = "bg-white p-4 rounded-xl shadow text-center";
            badgeCard.innerHTML = `
              <i class="fa fa-medal text-yellow-500 text-3xl mb-2"></i>
              <p class="font-semibold">${badge}</p>
            `;
            achievementsContainer.appendChild(badgeCard);
          }
        });
      }
    });

  } else {
    usernameEl.textContent = "Guest";
  }
});