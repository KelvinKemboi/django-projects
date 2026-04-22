import React from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import Login from "./auth/login.jsx"
import ProtectedRoute from "./auth/ProtectedRoute.jsx"
import Register from "./auth/register.jsx"
import { useAuth } from "./auth/AuthContext.jsx"
import Navbar from "./components/Navbar.jsx"
import GoalsPage from "./pages/GoalsPage"
import HabitsPage from "./pages/HabitsPage"

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        {/* The root route acts like a smart handoff based on whether a token is already present. */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/habits" : "/login"} replace />}
        />
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/habits" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/habits" replace /> : <Register />}
        />
        {/* Everything nested here assumes the user already passed through login. */}
        <Route element={<ProtectedRoute />}>
          <Route path="/habits" element={<HabitsPage />} />
          <Route path="/goals" element={<GoalsPage />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
