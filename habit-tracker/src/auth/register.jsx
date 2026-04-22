import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "./AuthContext.jsx"
import { getApiErrorMessage } from "../lib/api.js"

const REGISTER_API = "/api/register/"
const LOGIN_API = "/api/login/"

function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    username: "",
    email: "",
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
      // Registration and login are split on the backend, so we create the account first.
      const registerResponse = await fetch(REGISTER_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!registerResponse.ok) {
        throw new Error(
          await getApiErrorMessage(
            registerResponse,
            `Failed to register (${registerResponse.status})`,
          ),
        )
      }

      // ...then immediately exchange the new credentials for JWTs so the session starts seamlessly.
      const loginResponse = await fetch(LOGIN_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      })

      if (!loginResponse.ok) {
        throw new Error(
          await getApiErrorMessage(loginResponse, `Failed to log in (${loginResponse.status})`),
        )
      }

      const tokenData = await loginResponse.json()
      login({
        access: tokenData.access,
        refresh: tokenData.refresh,
        username: formData.username.trim(),
      })

      // New users land inside the authenticated app right away.
      navigate("/habits", { replace: true })
    } catch (error) {
      setApiError(error.message || "Failed to register")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-md items-center px-4 py-8">
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Register</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create an account to keep your habit data tied to your user.
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
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
              autoComplete="email"
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
              autoComplete="new-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-blue-700 hover:text-blue-800">
            Log in
          </Link>
        </p>
      </section>
    </main>
  )
}

export default Register
