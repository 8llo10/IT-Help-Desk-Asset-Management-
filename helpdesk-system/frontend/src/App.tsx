import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import TicketsPage from "./pages/TicketsPage";
import DashboardLayout from "./layouts/DashboardLayout";
import CreateTicketPage from "./pages/CreateTicketPage";

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={
            token
              ? <Navigate to="/dashboard" />
              : <Navigate to="/login" />
          }
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          element={
            token
              ? <DashboardLayout />
              : <Navigate to="/login" />
          }
        >

          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/tickets"
            element={<TicketsPage />}
          />

          <Route
            path="/tickets/new"
            element={<CreateTicketPage />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;