import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

// Set environment variable untuk WebSocket
process.env.REACT_APP_WS_URL =
  process.env.NODE_ENV === "production"
    ? "wss://api.yourdomain.com" // Ganti dengan domain produksi
    : "ws://localhost:5000"; // Untuk development

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
