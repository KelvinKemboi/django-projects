import React from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar"
import HabitsPage from "./pages/HabitsPage"
import GoalsPage from "./pages/GoalsPage"

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/habits" replace />} />
        <Route path="/habits" element={<HabitsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
      </Routes>
    </div>
  )
}

export default App
