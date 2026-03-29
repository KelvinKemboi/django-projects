import React, { useMemo, useState } from "react"
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
  // Main page states- habits, filters, freq
  const [habits, setHabits] = useState(initialHabits)
  const [statusFilter, setStatusFilter] = useState("All habits")
  const [frequencyFilter, setFrequencyFilter] = useState("All")

  // Chnage the visible list only when habits or filters change.
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

  // Toggle today's completion and adjust progress for visual feedback.
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

  //edit action button to edit habits
  const handleEdit = (id) => {
    console.log(`Edit habit ${id}`)
  }

  // Remove a habit card from local state.
  const handleDelete = (id) => {
    setHabits((prev) => prev.filter((habit) => habit.id !== id))
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Habits</h1>
        <p className="mt-1 text-sm text-gray-600">Manage all your habits</p>
      </header>

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
