import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { loadScriptures } from "./lib/scripture-loader";

// Kick off scripture loading immediately so the IndexedDB cache is warm
// before the user navigates to Read/Search. No await — fire and forget.
loadScriptures().catch(() => {});

createRoot(document.getElementById("root")!).render(<App />);
