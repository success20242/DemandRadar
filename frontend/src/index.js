import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// =========================
// 🌍 GLOBAL ERROR HANDLERS
// =========================
window.addEventListener("error", (event) => {
  console.error("🔥 Global Error:", event.message);
  console.error(event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("🔥 Unhandled Promise Rejection:", event.reason);
});

// =========================
// 🚀 ROOT RENDER (ONLY ONCE)
// =========================
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ Root element not found!");
} else {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
