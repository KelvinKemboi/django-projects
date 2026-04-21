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
//delete goals
const handleDeleteGoal = async (goalId) => {
    setApiError("")
    setSuccessMessage("")

    try { //deleteing goal
      const response = await fetch(`${GOALS_API_BASE}${goalId}`, {
        method: "DELETE",
      })
      //error handling
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, `Failed to delete goal (${response.status})`))
      }
      //update goals to include all except deleted goal
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId))
      setSuccessMessage("Goal removed.")
    } catch (error) {
      setApiError(error.message || "Failed to remove goal")
    }
  }

  //goal progress
  const goalItems = useMemo(() => {
    //create copy of goal and store percentages for each
    return goals.map((goal) => {
      const progressPercent = Math.max(0, Math.min(100, Number(goal.habitProgressPercent || 0)))
      return {
        ...goal,
        progressPercent,
      }
    })
  }, [goals])

  //ui- (AI aided)
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Goals</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-600">
            Manage goals for your habits and track completion progress for each goal.
          </p>
        </div>
      </header>

      {apiError ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      ) : null}

      <section className="mb-8 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Current goals</h2>
          <p className="mt-2 text-sm text-gray-600">
            Each goal is connected to a habit and shows the habit progress percentage.
          </p>

          {isLoading ? (
            <div className="mt-6 text-sm text-gray-500">Loading goals…</div>
          ) : goalItems.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
              No goals have been added yet.
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {goalItems.map((goal) => (
                <article key={goal.id} className="rounded-2xl border border-gray-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{goal.habitName}</h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {goal.habitFrequency} habit • Target {goal.weekly_target} times per week
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>Streak: {goal.habitStreak} days</span>
                      <span>{goal.habitCompletedToday ? "Completed today" : "Not completed today"}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-sm text-gray-700">
                      <span>Progress level</span>
                      <span>{goal.progressPercent}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-600 transition-all"
                        style={{ width: `${goal.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                    >
                      Remove goal
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Add a goal</h2>
          <p className="mt-2 text-sm text-gray-600">
            Choose a habit and set a weekly target. You can add one goal per habit.
          </p>

          <form onSubmit={handleAddGoal} className="mt-6 space-y-4">
            <label className="block text-sm text-gray-700">
              Habit
              <select
                value={selectedHabitId}
                onChange={(event) => setSelectedHabitId(Number(event.target.value))}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900"
                disabled={availableHabits.length === 0}
              >
                {availableHabits.length === 0 ? (
                  <option value="">No habits available</option>
                ) : (
                  availableHabits.map((habit) => (
                    <option key={habit.id} value={habit.id}>
                      {habit.name} • {habit.frequency}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label className="block text-sm text-gray-700">
              Weekly target
              <input
                type="number"
                min="1"
                value={weeklyTarget}
                onChange={(event) => setWeeklyTarget(event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </label>

            <button
              type="submit"
              disabled={isSaving || availableHabits.length === 0}
              className="inline-flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isSaving ? "Saving..." : "Create goal"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
            <h3 className="font-semibold text-gray-900">Goal progress note</h3>
            <p className="mt-2">
              Progress is shown from the habit’s current completion percentage. A future update can use weekly completion details for more accurate goal tracking.
            </p>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default GoalsPage


