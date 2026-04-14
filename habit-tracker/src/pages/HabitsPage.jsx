import React, { useEffect, useMemo, useState } from "react"
import HabitForm from "../components/HabitForm"
import HabitsCard from "../components/HabitsCard"

// same url to be reused
const HABITS_API_BASE = "/api/habits/"

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

  return fallbackMessage
}

//react component
function HabitsPage() {
  // Main page state: API habits list, active filters, and form state.
  // formart=> current, updating variable= usestate(initial state)
  const [habits, setHabits] = useState([])
  const [statusFilter, setStatusFilter] = useState("All habits")
  const [frequencyFilter, setFrequencyFilter] = useState("All") //default all
  const [isFormOpen, setIsFormOpen] = useState(false) //for opening the form
  const [formMode, setFormMode] = useState("add") // initial add mode for form(add/edit)
  const [editingHabitId, setEditingHabitId] = useState(null) //null if no habit
  const [isLoading, setIsLoading] = useState(true) //if data is still being fetched from backend
  const [apiError, setApiError] = useState("") //no initial error

  // useMemo- Resolve the selected habit object only when editing.
  const editingHabit = useMemo(
    () => habits.find((habit) => habit.id === editingHabitId) ?? null, //calculate value- loops hough habits and finds the one matching editinghabitid
    [habits, editingHabitId], //state dependencie that are being changed- calculations happen only when they change
  )

  // Recompute the visible list only when habits or filters change by creating a new array with habits matching the filters
  const filteredHabits = useMemo(() => {
    return habits.filter((habit) => {
      //status
      const statusMatches =
        (statusFilter === "All habits") || //for all habits
        (statusFilter === "Completed" && habit.completedToday) || //for completed today
        (statusFilter === "Missed" && !habit.completedToday) //for missed

      //frequency
      const frequencyMatches =
        (frequencyFilter === "All") ||
        (habit.frequency === frequencyFilter)

      return statusMatches && frequencyMatches
    })
  }, [habits, statusFilter, frequencyFilter]) //state dependencies affected- calculations happen only when they change

  // Load habits from Django when the page mounts.
  useEffect(() => {
    const fetchHabits = async () => {
      setIsLoading(true) //loading data from backend
      setApiError("") //erase prev errors

      try {
        const response = await fetch(HABITS_API_BASE) //fetch from api
        if (!response.ok) { //for errors
          const message = await getApiErrorMessage(
            response,
            `Failed to load habits (${response.status})`, //fallback message
          )
          throw new Error(message)
        }

        const data = await response.json() //parse json data
        setHabits(Array.isArray(data) ? data : []) //store in habits/update habits list with setbabits
      } catch (error) {
        setApiError(error.message || "Failed to load habits") //displaying error message
      } finally {
        setIsLoading(false) //not loading
      }
    }

    fetchHabits() //call habits
  }, [])

  // Toggle today's completion and persist to backend.
  const handleToggleComplete = async (id) => {
    const targetHabit = habits.find((habit) => habit.id === id) //loop through habits to find habit with that id
    if (!targetHabit) {
      return //if not found
    }

    const nextCompletedToday = !targetHabit.completedToday //button to flip completed today
    const nextProgressPercent = nextCompletedToday
      ? Math.min(100, Number(targetHabit.progressPercent || 0) + 10) //if completed today, add 10 but never go past 100
      : Math.max(0, Number(targetHabit.progressPercent || 0) - 10) // if not completed delete 10 but never go past 100

    const payload = {
      completedToday: nextCompletedToday,
      progressPercent: nextProgressPercent,
    }

    // for updating some fields in the habits
    try {
      const response = await fetch(`/api/habits/${id}`, {
        method: "PATCH", //not the whole habit
        headers: {
          "Content-Type": "application/json", //send json
        },
        body: JSON.stringify(payload), //convert paybload to json
      })

      //if failed trhow error
      if (!response.ok) {
        const message = await getApiErrorMessage(
          response,
          `Failed to update habit (${response.status})`,
        )
        throw new Error(message)
      }
      
      //save updated json in variable
      const updatedHabit = await response.json()
      setHabits((prev) => prev.map((habit) => (habit.id === id ? updatedHabit : habit)))
      setApiError("") //set habits to updated one
    } catch (error) {
      setApiError(error.message || "Failed to update habit")
    }
  }

  // Open form for creating a new habit.
  const handleAddClick = () => {
    setFormMode("add")
    setEditingHabitId(null)
    setIsFormOpen(true)
  }

  // Open form for editing a selected habit.
  const handleEdit = (id) => {
    setFormMode("edit")
    setEditingHabitId(id)
    setIsFormOpen(true)
  }

  // Remove a habit card from backend and local state.
  const handleDelete = async (id) => {
    //delete method
    try {
      const response = await fetch(`/api/habits/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const message = await getApiErrorMessage(
          response,
          `Failed to delete habit (${response.status})`,
        )
        throw new Error(message)
      }

      setHabits((prev) => prev.filter((habit) => habit.id !== id)) //keep all habits except the deleted one
      setApiError("") //clear error
    } catch (error) {
      setApiError(error.message || "Failed to delete habit")
    }
  }

  // Persist add/edit form results into backend and local state.
  const handleSubmitForm = async (values) => {
    const isEdit = formMode === "edit" && editingHabitId !== null
    const endpoint = isEdit ? `/api/habits/${editingHabitId}` : HABITS_API_BASE
    const method = isEdit ? "PATCH" : "POST" 

    //object copying all values
    const payload = {
      ...values,
      streak: Number(values.streak) || 0,
      progressPercent: Math.max(0, Math.min(100, Number(values.progressPercent) || 0)),
      completedToday: Boolean(values.completedToday),
      frequency: values.frequency || "Daily",
    }

    try {
      const response = await fetch(endpoint, {
        method, //patch or post depending on whther editing or not
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const message = await getApiErrorMessage(
          response,
          `Failed to save habit (${response.status})`,
        )
        throw new Error(message)
      }

      const savedHabit = await response.json() //saved habit/changed

      if (isEdit) { //replace changed habit wiht new one and save in habits-patch
        setHabits((prev) =>
          prev.map((habit) => (habit.id === editingHabitId ? savedHabit : habit)),
        )
      } else { //just append to the habits list-post
        setHabits((prev) => [...prev, savedHabit])
      }
      //reset states for forms, errors
      setIsFormOpen(false)
      setEditingHabitId(null)
      setFormMode("add")
      setApiError("")
    } catch (error) {
      setApiError(error.message || "Failed to save habit")
    }
  }

  //CANCEL button- reset states
  const handleCancelForm = () => {
    setIsFormOpen(false)
    setEditingHabitId(null)
    setFormMode("add")
  }

  //UI wrapper ***AI aided***
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Habits</h1>
          <p className="mt-1 text-sm text-gray-600">Manage all your habits</p>
        </div>

        {/* Add option for creating a new habit. */}
        <button
          type="button"
          onClick={handleAddClick}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add Habit
        </button>
      </header>

      {apiError ? (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {apiError}
        </p>
      ) : null}

      {isFormOpen && (
        <section className="mb-6">
          <HabitForm
            key={`${formMode}-${editingHabitId ?? "new"}`}
            mode={formMode}
            initialValues={formMode === "edit" ? editingHabit : null}
            onSubmit={handleSubmitForm}
            onCancel={handleCancelForm}
          />
        </section>
      )}

      <section className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filters:</span>

          {/* Status filter: all habits vs completion state. */}
          <div className="flex flex-wrap gap-2">
            {["All habits", "Completed", "Missed"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatusFilter(option)}
                className={`rounded-full px-3 py-1 text-sm ${
                  statusFilter === option
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Frequency filter: daily or weekly habits. */}
          <div className="ml-auto flex flex-wrap gap-2">
            {["All", "Daily", "Weekly"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFrequencyFilter(option)}
                className={`rounded-full px-3 py-1 text-sm ${
                  frequencyFilter === option
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Card grid. Falls back to an empty-state message when nothing matches. */}
      <section className="grid gap-4 sm:grid-cols-2">
        {isLoading ? (
          <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-600 sm:col-span-2">
            Loading habits...
          </p>
        ) : filteredHabits.length > 0 ? (
          filteredHabits.map((habit) => (
            <HabitsCard
              key={habit.id}
              habit={habit}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-600 sm:col-span-2">
            No habits match these filters.
          </p>
        )}
      </section>
    </main>
  )
}

export default HabitsPage
