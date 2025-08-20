// footer.js
export function initFooter() {
  const footerContainer = document.createElement("nav");
  footerContainer.className = "bottom-nav fixed bottom-0 w-full bg-gray-800 flex justify-around items-center h-16 px-2 shadow-t";

  footerContainer.innerHTML = `
    <button onclick="window.location.href='index.html'" class="flex flex-col items-center text-white px-4 py-2">
 <i data-feather="home"></i>
</button>
    
<button onclick="window.location.href='bookmarks.html'" class="flex flex-col items-center text-white px-4 py-2">
<i data-feather="bookmark"></i>
</button>
    
<button onclick="window.location.href='submit.html'" class="flex flex-col items-center text-white px-4 py-2">
 <i data-feather="plus-circle"></i>
</button>
    
<button onclick="window.location.href='account.html'" class="flex flex-col items-center text-white px-4 py-2">
 <i data-feather="user"></i>
</button>
    
<button onclick="window.location.href='dashboard.html'" class="flex flex-col items-center text-white px-4 py-2">
<i data-feather="grid"></i>
</button>
  `;

  document.body.appendChild(footerContainer);

  // Replace Feather icons
  if (window.feather) feather.replace();

  // Optional: add bottom padding to body to prevent content overlap
  document.body.style.paddingBottom = "4rem";
}
