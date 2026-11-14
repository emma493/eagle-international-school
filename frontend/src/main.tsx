import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import UpdateSnackbar from "./components/sync/UpdateSnackbar";
import { watchForUpdate } from "./lib/swUpdate";
import "./index.css";

// Register Firebase Cloud Messaging service worker for push notifications
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then((registration) => {
      watchForUpdate(registration);
    }).catch((err) => {
      console.log("Service Worker registration failed: ", err);
    });
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <UpdateSnackbar />
    </AuthProvider>
  </React.StrictMode>
);
