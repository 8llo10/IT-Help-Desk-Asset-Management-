import { StrictMode } from "react";
import ReactDOM from "react-dom/client";

import { AuthProvider } from "./context/AuthContext";
import App from "./App";

import "./styles/tokens.css";
import "./styles/globals.css";
import "./styles/animations.css";
import "./styles/layout.css";
import "./styles/components.css";
import "./styles/forms.css";
import "./styles/tables.css";
import "./styles/dashboard.css";
import "./styles/login.css";

ReactDOM.createRoot(
  document.getElementById("root")!
).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);