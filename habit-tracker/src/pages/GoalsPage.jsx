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

//load data from django habits when page mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true) //loading data
      setApiError("") //clear current api error

      try {
        const [habitsResponse, goalsResponse] = await Promise.all([
          fetch(HABITS_API_BASE),
          fetch(GOALS_API_BASE),
        ]) //fetch and store habits & goals form api
        
        //error-habit fetch failed
        if (!habitsResponse.ok) {
          throw new Error(await getApiErrorMessage(habitsResponse, `Failed to load habits (${habitsResponse.status})`))
        }
        //error-goal fetch failed
        if (!goalsResponse.ok) {
          throw new Error(await getApiErrorMessage(goalsResponse, `Failed to load goals (${goalsResponse.status})`))
        }
        
        //else store data in varaibles
        const habitsData = await habitsResponse.json() 
        const goalsData = await goalsResponse.json()
        
        //set current habit & goals list to fetched habits
        setHabits(Array.isArray(habitsData) ? habitsData : [])
        setGoals(Array.isArray(goalsData) ? goalsData : [])
        setApiError("") //clear errors
      } catch (error) {
        setApiError(error.message || "Failed to load goal data") //error handling
      } finally {
        setIsLoading(false) //stop loading data
      }
    }

    fetchData() //fetch data
  }, [])
  
 //perform changes in goals per habits
  const goalsByHabitId = useMemo(() => {
    //use maps to retrieve habit
    return goals.reduce((map, goal) => {
      map[goal.habit] = goal
      return map
    }, {})
  }, [goals]) 

  const availableHabits = useMemo(() => {
    return habits.filter((habit) => !goalsByHabitId[habit.id]) //all habits excluding id habit
  }, [habits, goalsByHabitId])

  useEffect(() => {
    if (!selectedHabitId && availableHabits.length > 0) {
      setSelectedHabitId(availableHabits[0].id)
    }
  }, [availableHabits, selectedHabitId])

  //adding goal
  const handleAddGoal = async (event) => {
    event.preventDefault()
    if (!selectedHabitId) {
      return
    }

    setIsSaving(true) //load saving state
    setApiError("") //clear messages
    setSuccessMessage("")

    try {
      //post new goal from fields
      const response = await fetch(GOALS_API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        }, 
        body: JSON.stringify({
          habit: selectedHabitId,
          weekly_target: Number(weeklyTarget) || 0,
        }),
      })

      //handling response error
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, `Failed to add goal (${response.status})`))
      }

      const newGoal = await response.json() //save goal
      //set goals, show message and clear errors
      setGoals((prev) => [...prev, newGoal])
      setSuccessMessage("Goal added successfully.")
      setWeeklyTarget(1)
      setApiError("")
    } catch (error) {
      setApiError(error.message || "Failed to add goal")
    } finally {
      setIsSaving(false)
    }
  }

  return(

    <div>

    </div>
  )
}

export default GoalsPage


