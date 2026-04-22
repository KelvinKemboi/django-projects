const getApiErrorMessage = async (response, fallbackMessage) => {
  try {
    const data = await response.json()

    if (typeof data === "string") {
      return data
    }

    if (data?.detail) {
      return data.detail
    }

    const firstKey = Object.keys(data || {})[0]
    if (firstKey) {
      const firstValue = data[firstKey]
      if (Array.isArray(firstValue) && firstValue.length > 0) {
        return `${firstKey}: ${firstValue[0]}`
      }
      if (typeof firstValue === "string") {
        return `${firstKey}: ${firstValue}`
      }
    }
  } catch {
    // Fall back to default text when response body is not JSON.
  }

  return fallbackMessage
}

const authFetch = (url, options = {}) => {
  const accessToken = localStorage.getItem("habit_tracker_access_token")
  const headers = new Headers(options.headers || {})

  // Protected Django endpoints expect the Bearer token on every request.
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`)
  }

  return fetch(url, {
    ...options,
    headers,
  })
}

export { authFetch, getApiErrorMessage }
