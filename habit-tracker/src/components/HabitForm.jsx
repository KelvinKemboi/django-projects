import React, { useState } from "react"

function HabitForm({ mode, initialValues, onSubmit, onCancel }) {
  // Initialize form state from edit values or use defaults for add mode.
  const [formData, setFormData] = useState(() => ({
    name: initialValues?.name ?? "",
    frequency: initialValues?.frequency ?? "Daily",
    streak: initialValues?.streak ?? 0,
    progressPercent: initialValues?.progressPercent ?? 0,
    completedToday: initialValues?.completedToday ?? false,
  }))

  // hange handler for all form field types.
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  // handles values before submit
  const handleSubmit = (event) => {
    event.preventDefault()

    const payload = {
      ...formData,
      name: formData.name.trim(),
      streak: Number(formData.streak) || 0,
      progressPercent: Math.max(0, Math.min(100, Number(formData.progressPercent) || 0)),
      completedToday: Boolean(formData.completedToday),
    }

    if (!payload.name) {
      return
    }

    // Payload for add/edit behavior
    onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">
        {mode === "edit" ? "Edit Habit" : "Add Habit"}
      </h2>

      {/* inputs for habit details. */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-gray-700 sm:col-span-2">
          Habit name
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Drink Water"
            className="rounded-md border border-gray-300 px-3 py-2"
            required
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Frequency
          <select
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            className="rounded-md border border-gray-300 px-3 py-2"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Streak (days)
          <input
            type="number"
            name="streak"
            min="0"
            value={formData.streak}
            onChange={handleChange}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-gray-700">
          Progress (%)
          <input
            type="number"
            name="progressPercent"
            min="0"
            max="100"
            value={formData.progressPercent}
            onChange={handleChange}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="completedToday"
            checked={formData.completedToday}
            onChange={handleChange}
            className="h-4 w-4"
          />
          Completed today
        </label>
      </div>

      {/* Submit saves changes; cancel closes form without saving. */}
      <div className="mt-4 flex items-center gap-2">
        <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          {mode === "edit" ? "Save changes" : "Add habit"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default HabitForm
