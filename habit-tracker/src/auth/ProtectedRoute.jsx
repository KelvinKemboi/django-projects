import React from "react"
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth } from "./AuthContext.jsx"

// Redirect anonymous users before protected pages try to fetch user-specific data.
function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // Preserve the original destination so login can send the user back afterward.
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute
