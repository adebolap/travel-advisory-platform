import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("Starting app initialization...");

const container = document.getElementById("root");
if (!container) {
  throw new Error("Failed to find root element");
}

try {
  console.log("Creating root and mounting app...");
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log("App mounted successfully");
} catch (error) {
  console.error("Error mounting app:", error);
}