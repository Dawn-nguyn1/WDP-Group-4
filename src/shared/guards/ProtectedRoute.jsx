import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { Spin } from "antd";
import {
  selectIsAuthenticated,
  selectUserRole,
  selectIsLoading,
  fetchCurrentUser,
  selectUser,
} from "../../features/auth/slices/authSlice";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userRole = useSelector(selectUserRole);
  const isLoading = useSelector(selectIsLoading);
  const user = useSelector(selectUser);
  const location = useLocation();
  const dispatch = useDispatch();

  // If we have a token but no user data yet, fetch the current user
  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(fetchCurrentUser());
    }
  }, [isAuthenticated, user, dispatch]);

  // Show loading while fetching user
  if (isLoading || (isAuthenticated && !user)) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    if (userRole === "UTM_ADMIN") {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (userRole === "FLEET_OPERATOR") {
      return <Navigate to="/operator/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
