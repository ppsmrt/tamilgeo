// js/footer.js
const footer = `
  <footer class="bg-white border-t mt-10 p-4 text-center text-sm text-gray-600">
    <p class="font-semibold text-gray-700">TamilGeo V2.0 — User UI: Enhanced — Auto: Yes</p>
    <p class="text-gray-500">Powered By <span class="text-green-600 font-medium">Inteksoft Solutions @ 2025</span></p>
  </footer>
`;

document.addEventListener("DOMContentLoaded", () => {
  document.body.insertAdjacentHTML("beforeend", footer);
});
