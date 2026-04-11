import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// =========================
// 🌍 GLOBAL ERROR HANDLERS (IMPROVED)
// =========================
window.addEventListener("error", (event) => {
  console.error("🔥 Global Error:", event.message);
  console.error(event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("🔥 Unhandled Promise Rejection:", event.reason);
});

// =========================
// 🚀 APP WRAPPER
// =========================
function GlobalWrapper() {
  return (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// =========================
// 🚀 ROOT RENDER
// =========================
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("❌ Root element not found!");
} else {
  const root = ReactDOM.createRoot(rootElement);

  root.render(<GlobalWrapper />);
}
```
