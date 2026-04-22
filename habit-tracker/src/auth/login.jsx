import React, { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "./AuthContext.jsx"
import { getApiErrorMessage } from "../lib/api.js"

const LOGIN_API = "/api/login/"

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [apiError, setApiError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setApiError("")
    setIsSubmitting(true)

    try {
      // The login endpoint is SimpleJWT, so the response should include fresh access and refresh tokens.
      const response = await fetch(LOGIN_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, `Failed to log in (${response.status})`),
        )
      }

      const data = await response.json()
      login({
        access: data.access,
        refresh: data.refresh,
        username: formData.username.trim(),
      })

      // If the user came from a blocked route, return them there instead of always forcing /habits.
      const redirectPath = location.state?.from?.pathname || "/habits"
      navigate(redirectPath, { replace: true })
    } catch (error) {
      setApiError(error.message || "Failed to log in")
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-md items-center px-4 py-8">
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Log in</h1>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to manage your habits and goals with your own account.
        </p>

        {apiError ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {apiError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm text-gray-700">
            Username
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              autoComplete="username"
              required
            />
          </label>

          <label className="block text-sm text-gray-700">
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Need an account?{" "}
          <Link to="/register" className="font-medium text-blue-700 hover:text-blue-800">
            Register
          </Link>
        </p>
      </section>
    </main>
  )
}

export default Login
