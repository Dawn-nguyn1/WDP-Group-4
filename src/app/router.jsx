import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "../shared/layouts/AdminLayout/AdminLayout";
import OperatorLayout from "../shared/layouts/OperatorLayout/OperatorLayout";

// Guards
import ProtectedRoute from "../shared/guards/ProtectedRoute";

// Auth pages (public)
import LoginPage from "../features/auth/pages/LoginPage";
import RegisterPage from "../features/auth/pages/RegisterPage";

// Dashboard pages
import AdminDashboard from "../features/dashboard/pages/AdminDashboard";
import OperatorDashboard from "../features/dashboard/pages/OperatorDashboard";

// User pages
import UserPage from "../features/users/pages/UserPage";
import ProfilePage from "../features/users/pages/ProfilePage";

// Zone pages (admin CRUD, operator read-only)
import ZonePage from "../features/zones/pages/ZonePage";

// Drone pages (Phase 2)
import DronePage from "../features/drones/pages/DronePage";

const router = createBrowserRouter([
  // Public routes
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },

  // Admin routes
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["UTM_ADMIN"]}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "users",
        element: <UserPage />,
      },
      {
        path: "zones",
        element: <ZonePage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      // Phase 3: conflicts
      // {
      //   path: 'conflicts',
      //   element: <ConflictListPage />,
      // },
    ],
  },

  // Operator routes
  {
    path: "/operator",
    element: (
      <ProtectedRoute allowedRoles={["FLEET_OPERATOR"]}>
        <OperatorLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/operator/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <OperatorDashboard />,
      },
      {
        path: "zones",
        element: <ZonePage readOnly />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      // Phase 2: drones
      {
        path: "drones",
        element: <DronePage />,
      },
      // Phase 3: flight plans
      // {
      //   path: 'flight-plans',
      //   element: <FlightPlanListPage />,
      // },
      // Phase 4: flight sessions
      // {
      //   path: 'flight-sessions',
      //   element: <FlightSessionListPage />,
      // },
    ],
  },

  // Root redirect
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },

  // Catch-all 404
  {
    path: "*",
    element: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          gap: "16px",
        }}
      >
        <h1 style={{ fontSize: "48px", color: "#667eea" }}>404</h1>
        <p style={{ color: "#718096" }}>Page not found</p>
        <a href="/login" style={{ color: "#667eea" }}>
          Go to Login
        </a>
      </div>
    ),
  },
]);

export default router;
