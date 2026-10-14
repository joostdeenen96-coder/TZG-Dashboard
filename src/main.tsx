import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/barlow-condensed/latin-500.css";
import "@fontsource/barlow-condensed/latin-600.css";
import "@fontsource/barlow-condensed/latin-700.css";
import "@fontsource/source-sans-3/latin-400.css";
import "@fontsource/source-sans-3/latin-500.css";
import "@fontsource/source-sans-3/latin-600.css";
import "@fontsource/source-sans-3/latin-700.css";
import "./index.css";
import App from "./App.tsx";
import { ScreenGuard } from "./components/ScreenGuard.tsx";
import { installTvGuards, tvLog } from "./services/tvLog.ts";

installTvGuards();

const root = document.getElementById("root");
if (!root) {
  tvLog("error", "scherm", "Root ontbreekt.");
} else {
  createRoot(root).render(
    <StrictMode>
      <ScreenGuard>
        <App />
      </ScreenGuard>
    </StrictMode>,
  );
}
