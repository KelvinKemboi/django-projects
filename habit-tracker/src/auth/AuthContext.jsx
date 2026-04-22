import React, { createContext, useContext, useEffect, useState } from "react"

// These keys stay centralized so the auth layer and API helper always read the same storage slots.
const ACCESS_TOKEN_KEY = "habit_tracker_access_token"
const REFRESH_TOKEN_KEY = "habit_tracker_refresh_token"
const USERNAME_KEY = "habit_tracker_username"

const AuthContext = createContext(null)

// Pull auth from localStorage on refresh so the app does not forget the current session.
const readStoredAuth = () => ({
  accessToken: localStorage.getItem(ACCESS_TOKEN_KEY) || "",
  refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY) || "",
  username: localStorage.getItem(USERNAME_KEY) || "",
})

function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => readStoredAuth())

  useEffect(() => {
    setAuthState(readStoredAuth())
  }, [])

  // A successful login updates both storage and React state so routing can react immediately.
  const login = ({ access, refresh, username }) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access)
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
    localStorage.setItem(USERNAME_KEY, username || "")

    setAuthState({
      accessToken: access,
      refreshToken: refresh,
      username: username || "",
    })
  }

  const logout = () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USERNAME_KEY)

    setAuthState({
      accessToken: "",
      refreshToken: "",
      username: "",
    })
  }

  return (
    <AuthContext.Provider
      value={{
        accessToken: authState.accessToken,
        refreshToken: authState.refreshToken,
        username: authState.username,
        isAuthenticated: Boolean(authState.accessToken),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    // Failing loudly here is better than letting auth consumers behave unpredictably.
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

export { AuthProvider, useAuth }
