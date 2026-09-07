import React, { useState } from "react"
import { Link } from "react-router-dom"
import { getApiErrorMessage } from "../lib/api.js"

const FORGOT_PASSWORD_API = "/api/reset-password/"

// ForgotPassword component handles the process of requesting a password reset link
function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [apiError, setApiError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Handle form submission for requesting a password reset link
  const handleSubmit = async (event) => {
    event.preventDefault()
    setApiError("")
    setIsSubmitting(true)

    //  Send a POST request to the forgot password API with the provided email
    try {
      const response = await fetch(FORGOT_PASSWORD_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      // Check if the response is not OK
      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, `Failed to send reset link (${response.status})`),
        )
      }

      // The backend always reports success here so we don't leak which emails are registered.
      setIsSubmitted(true)
    } catch (error) {
      setApiError(error.message || "Failed to send reset link")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-md items-center px-4 py-8">
      <section className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Forgot password</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter your account email and we'll send you a link to reset your password.
        </p>

        {apiError ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {apiError}
          </div>
        ) : null}

        {isSubmitted ? (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            If an account with that email exists, a reset link has been sent.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-sm text-gray-700">
              Email
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                autoComplete="email"
                required
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="mt-4 text-sm text-gray-600">
          Remembered your password?{" "}
          <Link to="/login" className="font-medium text-blue-700 hover:text-blue-800">
            Log in
          </Link>
        </p>
      </section>
    </main>
  )
}

export default ForgotPassword
