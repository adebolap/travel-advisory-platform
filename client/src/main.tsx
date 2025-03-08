import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Enhanced error boundary for initialization
try {
  const container = document.getElementById("root");
  if (!container) {
    throw new Error("Root container not found");
  }

  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );

  // Log successful mount
  console.info("✅ App mounted successfully");

  // Deferred service worker registration
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      try {
        navigator.serviceWorker.register('/service-worker.js')
          .then((registration) => {
            console.info('ServiceWorker registered:', registration.scope);
          })
          .catch((error) => {
            console.warn('ServiceWorker registration failed:', error);
          });
      } catch (error) {
        console.warn('ServiceWorker registration error:', error);
      }
    });
  }
} catch (error) {
  console.error("❌ Error mounting app:", error);
  // Display a user-friendly error message
  const errorContainer = document.createElement('div');
  errorContainer.style.cssText = 'padding: 20px; text-align: center;';
  errorContainer.innerHTML = `
    <h1>Something went wrong</h1>
    <p>Please try refreshing the page.</p>
  `;
  document.body.appendChild(errorContainer);
}

// Listen for app updates and manage hot-reloading
if (import.meta.hot) {
  import.meta.hot.accept();
  console.info("♻️ Hot Module Replacement enabled");
}

// Graceful unmounting if needed
window.addEventListener("beforeunload", () => {
  console.info("👋 Cleaning up before unload...");
  root.unmount();
});

// Handling offline and online states for better UX
window.addEventListener("online", () => {
  console.info("📶 Back online");
});

window.addEventListener("offline", () => {
  console.warn("📴 You are offline. Some features may not work.");
});