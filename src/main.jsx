// ✅ Corrected main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";

import { UserProvider } from "./context/UserProvider.jsx";
import { ProblemProvider } from "./context/ProblemProvider.jsx"; // ✅ FIXED IMPORT
import { NotesProvider } from "./context/NotesProvider.jsx"; // 👈 import it at top

import 'bootstrap/dist/css/bootstrap.min.css';
import "./index.css";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <ProblemProvider>
          <NotesProvider> {/* ✅ Add this line */}
            <App />
          </NotesProvider>
        </ProblemProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
