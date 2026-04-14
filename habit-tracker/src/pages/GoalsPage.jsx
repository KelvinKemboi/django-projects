import React, { useEffect, useMemo, useState } from "react"

//api endpoints
const HABITS_API_BASE = "/api/habits/"
const GOALS_API_BASE = "/api/goals/"

//error message-customized from
//converts api error messages into ones readable by users
const getApiErrorMessage = async (response, fallbackMessage) => {
  try {
    const data = await response.json() //store json response in data

    if (typeof data === "string") { // if normal string return that
      return data
    }

    if (data?.detail) { //safely checks if data has a detail property
      return data.detail
    }

    const firstKey = Object.keys(data || {})[0] //store first key of the data object. if null pick empty dict
    if (firstKey) {
      const firstValue = data[firstKey]
      if (Array.isArray(firstValue) && firstValue.length > 0) { //if value is an array and has more than one item return first item idx 0
        return `${firstKey}: ${firstValue[0]}`
      }
      if (typeof firstValue === "string") { //if plain string 
        return `${firstKey}: ${firstValue}`
      }
    }
  } catch {
    // Fall back to default text when response is not JSON.
  }
}

function GoalsPage() {
    // use states modified from habits apge
  const [habits, setHabits] = useState([]) //habits
  const [goals, setGoals] = useState([]) //goals
  const [selectedHabitId, setSelectedHabitId] = useState("") //specific habit
  const [weeklyTarget, setWeeklyTarget] = useState(1) //weekly target
  const [isLoading, setIsLoading] = useState(true) //loading data from backend
  const [isSaving, setIsSaving] = useState(false) //saving goal progress
  const [apiError, setApiError] = useState("") //erro message
  const [successMessage, setSuccessMessage] = useState("") //success message

  return (
    <div>
        
    </div>
  )
}

export default GoalsPage


