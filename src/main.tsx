
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";

  const rootElement = document.getElementById("root")!;
  rootElement.removeAttribute("data-prerendered");
  createRoot(rootElement).render(<App />);