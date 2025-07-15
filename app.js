
window.addEventListener("load", () => {
    const iframe = document.getElementById("main-content");
    const loader = document.getElementById("loader");

    iframe.onload = () => {
        loader.style.display = "none";
        iframe.style.display = "block";
    };
});

// Register service worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").then(() => {
        console.log("Service Worker Registered");
    });
}
