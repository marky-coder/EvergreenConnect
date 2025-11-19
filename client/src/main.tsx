// client/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

/**
 * If you're using the 404 → index.html redirect approach on GitHub Pages,
 * the original path is preserved in ?p=<encoded-path>. When present
 * restore it to the location so the client router can handle it.
 */
(function restoreOriginalPathFrom404() {
  try {
    const params = new URLSearchParams(window.location.search);
    const original = params.get("p");
    if (original) {
      const decoded = decodeURIComponent(original);
      const normalized = decoded.startsWith("/") ? decoded : "/" + decoded;
      // replace so we don't create an extra history entry
      window.history.replaceState({}, "", normalized);
    }
  } catch (err) {
    // don't block rendering if anything goes wrong here
    // console.debug("restoreOriginalPathFrom404 error", err);
  }
})();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* If your site is served from a subpath e.g. /repo-name/, set basename="/repo-name" */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
