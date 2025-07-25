import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "./context/UserProvider";

const ProtectedRoute = ({ children }) => {
  const { user, isAuthLoading, isAuthenticated } = useUser();

  if (isAuthLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  const checkAuth = () => {
    if (isAuthenticated()) return true;

    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        return !!parsedUser?.email;
      } catch (error) {
        console.error("❌ Failed to parse user from localStorage:", error);
        localStorage.removeItem("user");
        return false;
      }
    }

    return false;
  };

  if (!checkAuth()) {
    console.warn("❌ Not authenticated, redirecting...");
    return <Navigate to="/login" replace />;
  }

  console.log("✅ Authenticated user");
  return children;
};

export default ProtectedRoute;
