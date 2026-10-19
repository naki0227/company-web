import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

const lang = document.documentElement.lang === "ja" ? "ja" : "en";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App lang={lang} />
  </StrictMode>,
);
