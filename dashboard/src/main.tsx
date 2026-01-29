import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./shared/index.ts";

/**
 * Main Application Entry Point
 *
 * MSW (Mock Service Worker) is conditionally started based on the
 * VITE_ENABLE_MSW environment variable before React renders.
 *
 * This allows seamless switching between mock data (MSW) and real API
 * by simply changing the environment variable.
 */

async function enableMocking() {
  // Check if MSW should be enabled
  const shouldEnableMSW = import.meta.env.VITE_ENABLE_MSW === "true";

  if (!shouldEnableMSW) {
    console.log("MSW is disabled. Connecting to real API.");
    return;
  }

  // Dynamically import MSW to avoid including it in production bundles
  const { startWorker } = await import("./mocks/browser");

  // Start MSW with custom options
  return startWorker({
    onUnhandledRequest: "warn",
  }).then(() => {
    console.log("🔶 MSW enabled. Using mock API responses.");
  });
}

// Enable MSW before rendering the app
enableMocking().then(() => {
  createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <StrictMode>
        <App />
      </StrictMode>
    </AuthProvider>,
  );
});
