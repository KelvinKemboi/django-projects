import React, { useEffect, useMemo, useState } from "react"
import HabitForm from "../components/HabitForm"
import HabitsCard from "../components/HabitsCard"

const HABITS_API_BASE = "/api/habits/"

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
    // Fall back to default text when response is not JSON.
  }

  return fallbackMessage
}

function HabitsPage() {
  // Main page state: API habits list, active filters, and form state.
  const [habits, setHabits] = useState([])
  const [statusFilter, setStatusFilter] = useState("All habits")
  const [frequencyFilter, setFrequencyFilter] = useState("All")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState("add")
  const [editingHabitId, setEditingHabitId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState("")

  // Resolve the selected habit object when editing.
  const editingHabit = useMemo(
    () => habits.find((habit) => habit.id === editingHabitId) ?? null,
    [habits, editingHabitId],
  )

  // Recompute the visible list only when habits or filters change.
  const filteredHabits = useMemo(() => {
    return habits.filter((habit) => {
      const statusMatches =
        statusFilter === "All habits" ||
        (statusFilter === "Completed" && habit.completedToday) ||
        (statusFilter === "Missed" && !habit.completedToday)

      const frequencyMatches =
        frequencyFilter === "All" || habit.frequency === frequencyFilter

      return statusMatches && frequencyMatches
    })
  }, [habits, statusFilter, frequencyFilter])

  // Load habits from Django when the page mounts.
  useEffect(() => {
    const fetchHabits = async () => {
      setIsLoading(true)
      setApiError("")

      try {
        const response = await fetch(HABITS_API_BASE)
        if (!response.ok) {
          const message = await getApiErrorMessage(
            response,
            `Failed to load habits (${response.status})`,
          )
          throw new Error(message)
        }

        const data = await response.json()
        setHabits(Array.isArray(data) ? data : [])
      } catch (error) {
        setApiError(error.message || "Failed to load habits")
      } finally {
        setIsLoading(false)
      }
    }

    fetchHabits()
  }, [])

  // Toggle today's completion and persist to backend.
  const handleToggleComplete = async (id) => {
    const targetHabit = habits.find((habit) => habit.id === id)
    if (!targetHabit) {
      return
    }

    const nextCompletedToday = !targetHabit.completedToday
    const nextProgressPercent = nextCompletedToday
      ? Math.min(100, Number(targetHabit.progressPercent || 0) + 10)
      : Math.max(0, Number(targetHabit.progressPercent || 0) - 10)

    const payload = {
      completedToday: nextCompletedToday,
      progressPercent: nextProgressPercent,
    }

    try {
      const response = await fetch(`/api/habits/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const message = await getApiErrorMessage(
          response,
          `Failed to update habit (${response.status})`,
        )
        throw new Error(message)
      }

      const updatedHabit = await response.json()
      setHabits((prev) => prev.map((habit) => (habit.id === id ? updatedHabit : habit)))
      setApiError("")
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

      setHabits((prev) => prev.filter((habit) => habit.id !== id))
      setApiError("")
    } catch (error) {
      setApiError(error.message || "Failed to delete habit")
    }
  }

  // Persist add/edit form results into backend and local state.
  const handleSubmitForm = async (values) => {
    const isEdit = formMode === "edit" && editingHabitId !== null
    const endpoint = isEdit ? `/api/habits/${editingHabitId}` : HABITS_API_BASE
    const method = isEdit ? "PATCH" : "POST"

    const payload = {
      ...values,
      streak: Number(values.streak) || 0,
      progressPercent: Math.max(0, Math.min(100, Number(values.progressPercent) || 0)),
      completedToday: Boolean(values.completedToday),
      frequency: values.frequency || "Daily",
    }

    try {
      const response = await fetch(endpoint, {
        method,
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

      const savedHabit = await response.json()

      if (isEdit) {
        setHabits((prev) =>
          prev.map((habit) => (habit.id === editingHabitId ? savedHabit : habit)),
        )
      } else {
        setHabits((prev) => [...prev, savedHabit])
      }

      setIsFormOpen(false)
      setEditingHabitId(null)
      setFormMode("add")
      setApiError("")
    } catch (error) {
      setApiError(error.message || "Failed to save habit")
    }
  }

  const handleCancelForm = () => {
    setIsFormOpen(false)
    setEditingHabitId(null)
    setFormMode("add")
  }

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
