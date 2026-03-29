import React, { useMemo, useState } from "react"
import HabitForm from "../components/HabitForm"
import HabitsCard from "../components/HabitsCard"

// Seed data so the page can render before backend API integration.
const initialHabits = [
  {
    id: 1,
    name: "Drink Water",
    streak: 7,
    completedToday: true,
    progressPercent: 70,
    frequency: "Daily",
  },
  {
    id: 2,
    name: "Morning Walk",
    streak: 4,
    completedToday: false,
    progressPercent: 40,
    frequency: "Daily",
  },
  {
    id: 3,
    name: "Read 20 Pages",
    streak: 10,
    completedToday: true,
    progressPercent: 85,
    frequency: "Weekly",
  },
  {
    id: 4,
    name: "Plan Week",
    streak: 2,
    completedToday: false,
    progressPercent: 25,
    frequency: "Weekly",
  },
]

function HabitsPage() {
  // Main page state: habits list, active filters, and form state.
  const [habits, setHabits] = useState(initialHabits)
  const [statusFilter, setStatusFilter] = useState("All habits")
  const [frequencyFilter, setFrequencyFilter] = useState("All")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState("add")
  const [editingHabitId, setEditingHabitId] = useState(null)

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

  // Toggle today's completion and adjust progress for quick visual feedback.
  const handleToggleComplete = (id) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id
          ? {
              ...habit,
              completedToday: !habit.completedToday,
              progressPercent: habit.completedToday
                ? Math.max(0, habit.progressPercent - 10)
                : Math.min(100, habit.progressPercent + 10),
            }
          : habit,
      ),
    )
  }

  // Open form for creating a new habit.
  const handleAddClick = () => {
    setFormMode("add")
    setEditingHabitId(null)
    setIsFormOpen(true)
  }

  // Open form for editing a selected habit
  const handleEdit = (id) => {
    setFormMode("edit")
    setEditingHabitId(id)
    setIsFormOpen(true)
  }

  // Remove/delete a habit card from local state.
  const handleDelete = (id) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id))
  }

  // Persist add/edit form results into habits state.
  const handleSubmitForm = (values) => {
    if (formMode === "edit" && editingHabitId !== null) {
      setHabits((prev) =>
        prev.map((habit) =>
          habit.id === editingHabitId
            ? {
                ...habit,
                ...values,
              }
            : habit,
        ),
      )
    } else {
      setHabits((prev) => {
        const nextId = prev.length > 0 ? Math.max(...prev.map((habit) => habit.id)) + 1 : 1

        return [
          ...prev,
          {
            id: nextId,
            ...values,
          },
        ]
      })
    }

    setIsFormOpen(false)
    setEditingHabitId(null)
    setFormMode("add")
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
        {filteredHabits.length > 0 ? (
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
