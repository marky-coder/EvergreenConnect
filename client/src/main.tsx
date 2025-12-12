// client/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
/* Ensure animations are loaded */
import "./styles/animations.css";

/**
 * Restore original path when using GH Pages 404 -> index.html trick.
 */
(function restoreOriginalPathFrom404() {
  try {
    const params = new URLSearchParams(window.location.search);
    const original = params.get("p");
    if (original) {
      const decoded = decodeURIComponent(original);
      const normalized = decoded.startsWith("/") ? decoded : "/" + decoded;
      window.history.replaceState({}, "", normalized);
    }
  } catch (err) {
    // ignore
  }
})();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
