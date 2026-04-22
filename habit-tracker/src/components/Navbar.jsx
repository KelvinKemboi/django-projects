import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../auth/AuthContext.jsx"

function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, logout, username } = useAuth()

  // Clear auth state first, then push the user back to the public entry point.
  const handleLogout = () => {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    // Guests only get auth links; signed-in users get the app navigation and account controls.
    <nav className="flex relative w-full flex-wrap items-center justify-between gap-4 bg-blue-600 px-6 py-4 text-white">
      <h2 className="text-xl font-bold">Habit Tracker</h2>

      <div className="flex items-center gap-6">
        <ul className="flex gap-6">
          {isAuthenticated ? (
            <>
              <li>
                <Link to="/habits" className="hover:text-gray-200">
                  Habits
                </Link>
              </li>
              <li>
                <Link to="/goals" className="hover:text-gray-200">
                  Goals
                </Link>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="hover:text-gray-200">
                  Log in
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-gray-200">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>

        {isAuthenticated ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-blue-100">{username || "Signed in"}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-blue-300 px-3 py-1.5 hover:bg-blue-700"
            >
              Log out
            </button>
          </div>
        ) : null}
      </div>
    </nav>
  )
}

export default Navbar
