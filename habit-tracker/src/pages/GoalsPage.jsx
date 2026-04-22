import React, { useEffect, useMemo, useState } from "react"
import { authFetch, getApiErrorMessage } from "../lib/api.js"

const HABITS_API_BASE = "/api/habits/"
const GOALS_API_BASE = "/api/goals/"

function GoalsPage() {
  const [habits, setHabits] = useState([])
  const [goals, setGoals] = useState([])
  const [selectedHabitId, setSelectedHabitId] = useState("")
  const [weeklyTarget, setWeeklyTarget] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [apiError, setApiError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setApiError("")

      try {
        // Goals depend on the habits list, so both requests are loaded together before the page settles.
        const [habitsResponse, goalsResponse] = await Promise.all([
          authFetch(HABITS_API_BASE),
          authFetch(GOALS_API_BASE),
        ])

        if (!habitsResponse.ok) {
          throw new Error(
            await getApiErrorMessage(
              habitsResponse,
              `Failed to load habits (${habitsResponse.status})`,
            ),
          )
        }

        if (!goalsResponse.ok) {
          throw new Error(
            await getApiErrorMessage(goalsResponse, `Failed to load goals (${goalsResponse.status})`),
          )
        }

        const habitsData = await habitsResponse.json()
        const goalsData = await goalsResponse.json()

        setHabits(Array.isArray(habitsData) ? habitsData : [])
        setGoals(Array.isArray(goalsData) ? goalsData : [])
        setApiError("")
      } catch (error) {
        setApiError(error.message || "Failed to load goal data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Build a quick lookup so the form can hide habits that already have a goal.
  const goalsByHabitId = useMemo(() => {
    return goals.reduce((map, goal) => {
      map[goal.habit] = goal
      return map
    }, {})
  }, [goals])

  const availableHabits = useMemo(() => {
    return habits.filter((habit) => !goalsByHabitId[habit.id])
  }, [habits, goalsByHabitId])

  useEffect(() => {
    if (!selectedHabitId && availableHabits.length > 0) {
      // Pick a sensible default so the user can submit without an extra selection step.
      setSelectedHabitId(availableHabits[0].id)
    }
  }, [availableHabits, selectedHabitId])

  const handleAddGoal = async (event) => {
    event.preventDefault()
    if (!selectedHabitId) {
      return
    }

    setIsSaving(true)
    setApiError("")
    setSuccessMessage("")

    try {
      // Goal endpoints are protected, so this request relies on authFetch to attach the JWT.
      const response = await authFetch(GOALS_API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          habit: selectedHabitId,
          weekly_target: Number(weeklyTarget) || 0,
        }),
      })

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, `Failed to add goal (${response.status})`),
        )
      }

      const newGoal = await response.json()
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

  const handleDeleteGoal = async (goalId) => {
    setApiError("")
    setSuccessMessage("")

    try {
      const response = await authFetch(`${GOALS_API_BASE}${goalId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(response, `Failed to delete goal (${response.status})`),
        )
      }

      setGoals((prev) => prev.filter((goal) => goal.id !== goalId))
      setSuccessMessage("Goal removed.")
    } catch (error) {
      setApiError(error.message || "Failed to remove goal")
    }
  }

  // Clamp progress values before rendering to keep the bar stable if upstream data is noisy.
  const goalItems = useMemo(() => {
    return goals.map((goal) => {
      const progressPercent = Math.max(0, Math.min(100, Number(goal.habitProgressPercent || 0)))
      return {
        ...goal,
        progressPercent,
      }
    })
  }, [goals])

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
            <div className="mt-6 text-sm text-gray-500">Loading goals...</div>
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
                        {goal.habitFrequency} habit | Target {goal.weekly_target} times per week
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
                      {habit.name} | {habit.frequency}
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
              Progress is shown from the habit&apos;s current completion percentage. A future update can use weekly
              completion details for more accurate goal tracking.
            </p>
          </div>
        </aside>
      </section>
    </main>
  )
}

export default GoalsPage
