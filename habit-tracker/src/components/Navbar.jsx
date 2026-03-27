import { Link } from "react-router-dom"

function Navbar() {
  return (
    <nav className="flex justify-between items-center bg-blue-600 text-white px-6 py-4">
      <h2 className="text-xl font-bold">
        Habit Tracker
      </h2>
      <ul className="flex gap-6">
        <li>
          <Link to="/" className="hover:text-gray-200">
            Dashboard
          </Link>
        </li>
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
      </ul>
    </nav>
  )
}

export default Navbar