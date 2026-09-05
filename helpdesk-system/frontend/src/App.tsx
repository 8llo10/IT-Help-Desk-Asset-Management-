import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

import LoginPage from "./pages/LoginPage";

import DashboardPage from "./pages/DashboardPage";

import TicketsPage from "./pages/TicketsPage";
import CreateTicketPage from "./pages/CreateTicketPage";
import TicketDetailsPage from "./pages/TicketDetailsPage";

import AssetsPage from "./pages/AssetsPage";
import CreateAssetPage from "./pages/CreateAssetPage";
import EditAssetPage from "./pages/EditAssetPage";

import UsersPage from "./pages/UsersPage";
import UserDetailsPage from "./pages/UserDetailsPage";

import RolesPage from "./pages/RolesPage";
import RoleDetailsPage from "./pages/RoleDetailsPage";

import DepartmentsPage from "./pages/DepartmentsPage";
import CategoriesPage from "./pages/CategoriesPage";

import OrganizationsPage from "./pages/OrganizationsPage";
import BranchesPage from "./pages/BranchesPage";
import LocationsPage from "./pages/LocationsPage";
import TeamsPage from "./pages/TeamsPage";

import NotificationsPage from "./pages/NotificationsPage";
import ReportsPage from "./pages/ReportsPage";

import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";

import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* =====================================================
            DEFAULT ROUTE
            ===================================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        {/* =====================================================
            PUBLIC ROUTES
            ===================================================== */}

        <Route
          path="/login"
          element={<LoginPage />}
        />

        {/* =====================================================
            PROTECTED APPLICATION
            ===================================================== */}

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* ===================================================
              DASHBOARD
              =================================================== */}

          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          {/* ===================================================
              TICKETS
              =================================================== */}

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

          {/* ===================================================
              ASSETS
              =================================================== */}

          <Route
            path="/assets"
            element={<AssetsPage />}
          />

          <Route
            path="/assets/new"
            element={
              <RoleRoute
                allowedRoles={["ADMIN"]}
              >
                <CreateAssetPage />
              </RoleRoute>
            }
          />

          <Route
            path="/assets/:id/edit"
            element={
              <RoleRoute
                allowedRoles={["ADMIN"]}
              >
                <EditAssetPage />
              </RoleRoute>
            }
          />

          {/* ===================================================
              USERS
              =================================================== */}

          <Route
            path="/users"
            element={
              <RoleRoute
                allowedRoles={["ADMIN"]}
              >
                <UsersPage />
              </RoleRoute>
            }
          />

          <Route
            path="/users/:id"
            element={
              <RoleRoute
                allowedRoles={["ADMIN"]}
              >
                <UserDetailsPage />
              </RoleRoute>
            }
          />

          {/* ===================================================
              ROLES & PERMISSIONS
              =================================================== */}

          <Route
            path="/roles"
            element={
              <RoleRoute
                allowedRoles={["ADMIN"]}
              >
                <RolesPage />
              </RoleRoute>
            }
          />

          <Route
            path="/roles/:id"
            element={
              <RoleRoute
                allowedRoles={["ADMIN"]}
              >
                <RoleDetailsPage />
              </RoleRoute>
            }
          />

          {/* ===================================================
              ORGANIZATION STRUCTURE
              =================================================== */}

          <Route
            path="/organizations"
            element={
              <RoleRoute
                allowedRoles={["ADMIN"]}
              >
                <OrganizationsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/branches"
            element={
              <RoleRoute
                allowedRoles={["ADMIN"]}
              >
                <BranchesPage />
              </RoleRoute>
            }
          />

          <Route
            path="/locations"
            element={
              <RoleRoute
                allowedRoles={["ADMIN"]}
              >
                <LocationsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/departments"
            element={
              <RoleRoute
                allowedRoles={["ADMIN"]}
              >
                <DepartmentsPage />
              </RoleRoute>
            }
          />

          <Route
            path="/teams"
            element={
              <RoleRoute
                allowedRoles={["ADMIN"]}
              >
                <TeamsPage />
              </RoleRoute>
            }
          />

          {/* ===================================================
              CATEGORIES
              =================================================== */}

          <Route
            path="/categories"
            element={
              <RoleRoute
                allowedRoles={["ADMIN"]}
              >
                <CategoriesPage />
              </RoleRoute>
            }
          />

          {/* ===================================================
              NOTIFICATIONS
              =================================================== */}

          <Route
            path="/notifications"
            element={<NotificationsPage />}
          />

          {/* ===================================================
              REPORTS
              =================================================== */}

          <Route
            path="/reports"
            element={
              <RoleRoute
                allowedRoles={[
                  "ADMIN",
                  "TECHNICIAN",
                ]}
              >
                <ReportsPage />
              </RoleRoute>
            }
          />

          {/* ===================================================
              PROFILE
              =================================================== */}

          <Route
            path="/profile"
            element={<ProfilePage />}
          />

          <Route
            path="/profile/edit"
            element={<EditProfilePage />}
          />
        </Route>

        {/* =====================================================
            404
            ===================================================== */}

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}