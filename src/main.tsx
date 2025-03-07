import { createRoot } from "react-dom/client";
import "./assets/styles/global.css";
import App from "./pages/app";

createRoot(document.getElementById("root")!).render(<App />);
