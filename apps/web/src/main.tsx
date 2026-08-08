import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PortalProvider } from "@portalsdk/react";
import App from "./App";
import { portalClient } from "./lib/portal-client";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Falta el nodo #root en index.html");

createRoot(root).render(
  <StrictMode>
    {portalClient ? (
      <PortalProvider client={portalClient}>
        <App />
      </PortalProvider>
    ) : (
      <MissingKey />
    )}
  </StrictMode>,
);

function MissingKey() {
  return (
    <div
      style={{
        height: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#07090b",
        color: "#e05c5c",
        fontFamily: "'IBM Plex Mono',monospace",
        fontSize: 13,
        letterSpacing: ".06em",
        textAlign: "center",
        padding: 24,
      }}
    >
      <div>
        <p>● SIN QUIRÓFANO</p>
        <p style={{ color: "#7e949c" }}>
          Falta <code>VITE_PORTAL_API_KEY</code> en <code>.env.local</code>.
        </p>
      </div>
    </div>
  );
}
