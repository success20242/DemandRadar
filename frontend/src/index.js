import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

function GlobalWrapper() {
  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// =========================
// ⚡ GLOBAL ERROR HANDLER
// =========================
window.addEventListener("error", (event) => {
  console.error("Global Error Captured:", event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled Promise Rejection:", event.reason);
});

// =========================
// 🚀 BOOTSTRAP RENDER
// =========================
const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(<GlobalWrapper />);
