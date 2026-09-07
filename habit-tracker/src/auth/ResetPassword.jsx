import React, { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { getApiErrorMessage } from "../lib/api.js"

const RESET_PASSWORD_CONFIRM_API = "/api/reset-password-confirm/"

// ResetPassword component handles the password reset confirmation process
function ResetPassword() {
  const { uid, token } = useParams() // Extract uid and token from the URL parameters
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [apiError, setApiError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Handle input changes for the password and confirm password fields
  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle form submission for resetting the password
  const handleSubmit = async (event) => {
    event.preventDefault()
    setApiError("")

    if (formData.password !== formData.confirmPassword) {
      setApiError("Passwords do not match")
      return
    }

    setIsSubmitting(true)

    try {
     // Send a POST request to the reset password confirmation API with the uid, token, and new password
      const response = await fetch(RESET_PASSWORD_CONFIRM_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uid, token, password: formData.password }),
      })

      //  Check if the response is not OK
      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, `Failed to reset password (${response.status})`),
        )
      }

      // A fresh password means the user should sign back in with it explicitly.
      navigate("/login", { replace: true })
    } catch (error) {
      setApiError(error.message || "Failed to reset password")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-md items-center px-4 py-8">
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
        <p className="mt-2 text-sm text-gray-600">Enter a new password for your account.</p>

        {apiError ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {apiError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm text-gray-700">
            New password
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

          <label className="block text-sm text-gray-700">
            Confirm new password
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
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
            {isSubmitting ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          <Link to="/login" className="font-medium text-blue-700 hover:text-blue-800">
            Back to log in
          </Link>
        </p>
      </section>
    </main>
  )
}

export default ResetPassword
