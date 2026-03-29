import React from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import HabitsPage from "./pages/HabitsPage"

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/habits" replace />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route
          path="/goals"
          element={<div className="mx-auto max-w-5xl px-4 py-8 text-gray-700">Goals page coming soon.</div>}
        />
      </Routes>
    </div>
  )
}

export default App
