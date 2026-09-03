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
import TicketDetailsPage from "./pages/TicketDetailsPage";
import AssetsPage from "./pages/AssetsPage";
import CreateAssetPage from "./pages/CreateAssetPage";
import EditAssetPage from "./pages/EditAssetPage";
import UsersPage from "./pages/UsersPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import CategoriesPage from "./pages/CategoriesPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import ReportsPage from "./pages/ReportsPage";
import NotFoundPage from "./pages/NotFoundPage";

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

          <Route
            path="/tickets/:id"
            element={<TicketDetailsPage />}
          />

          <Route
            path="/assets"
            element={<AssetsPage />}
          />

          <Route
            path="/assets/new"
            element={<CreateAssetPage />}
          />

          <Route
            path="/assets/:id/edit"
            element={<EditAssetPage />}
          />

          <Route
            path="/users"
            element={<UsersPage />}
          />

          <Route
            path="/departments"
            element={<DepartmentsPage />}
          />

          <Route
            path="/categories"
            element={<CategoriesPage />}
          />

          <Route
            path="/profile"
            element={<ProfilePage />}
          />

          <Route
            path="/profile/edit"
            element={<EditProfilePage />}
          />

          <Route
            path="/reports"
            element={<ReportsPage />}
          />

          <Route
            path="*"
            element={<NotFoundPage />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;