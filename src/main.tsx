import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const lang = document.documentElement.lang === "ja" ? "ja" : "en";

const root = document.getElementById("root")!;
const app = (
  <StrictMode>
    <App lang={lang} />
  </StrictMode>
);
// The build pre-renders the page (scripts/prerender.mjs); `vite dev` serves an empty root.
if (root.firstElementChild) hydrateRoot(root, app);
else createRoot(root).render(app);
