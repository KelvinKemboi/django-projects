import React from "react"

function HabitsCard({ habit, onToggleComplete, onEdit, onDelete }) {
  // Progress values/percentages
  const progressPercent = Math.max(0, Math.min(100, habit.progressPercent ?? 0))

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        {/* Habit identity and streak summary. */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{habit.name}</h3>
          <p className="mt-1 text-sm text-gray-600">
            {habit.frequency} | Streak: {habit.streak} days
          </p>
        </div>

        {/* Card-level actions. */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(habit.id)}
            className="rounded-md border border-gray-300 px-2 py-1 text-sm hover:bg-gray-50"
            aria-label={`Edit ${habit.name}`}
            title="Edit"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(habit.id)}
            className="rounded-md border border-red-200 px-2 py-1 text-sm hover:bg-red-50"
            aria-label={`Delete ${habit.name}`}
            title="Delete"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Daily completion toggle for this habit. */}
      <label className="mt-4 flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={habit.completedToday}
          onChange={() => onToggleComplete(habit.id)}
          className="h-4 w-4"
        />
        {habit.completedToday ? "Completed today" : "Not completed today"}
      </label>

      {/* Visual completion progress bar. */}
      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-sm text-gray-600">
          <span>Progress</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-gray-200">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </article>
  )
}

export default HabitsCard
