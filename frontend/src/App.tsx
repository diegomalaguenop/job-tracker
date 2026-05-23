// src/App.tsx
import { useState } from 'react'
import type { Application, ApplicationCreate, ApplicationStatus } from './api/types'
import ApplicationModal from './components/ApplicationModal'
import ApplicationTable from './components/ApplicationTable'
import StatsBar from './components/StatsBar'
import { useApplications } from './hooks/useApplications'

const STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
]

export default function App() {
  const { applications, stats, loading, error, filters, setFilters, create, update, remove } =
    useApplications()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Application | null>(null)
  const [search, setSearch] = useState('')

  const openCreate = () => { setEditing(null); setModalOpen(true) }
  const openEdit = (app: Application) => { setEditing(app); setModalOpen(true) }
  const closeModal = () => { setModalOpen(false); setEditing(null) }

  const handleSave = async (data: ApplicationCreate) => {
    if (editing) {
      await update(editing.id, data)
    } else {
      await create(data)
    }
  }

  const handleDelete = async (app: Application) => {
    if (window.confirm(`Delete application to ${app.company}?`)) {
      await remove(app.id)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    setFilters(f => ({ ...f, search: val || undefined }))
  }

  const toggleStatus = (status: ApplicationStatus) => {
    setFilters(f => ({
      ...f,
      status: f.status === status ? undefined : status,
    }))
  }

  const clearFilters = () => {
    setFilters({})
    setSearch('')
  }

  const hasFilters = filters.status || filters.search

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Job Tracker</h1>
            <p className="text-sm text-gray-500">Track your Canadian job search</p>
          </div>
          <button
            onClick={openCreate}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            + Add application
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        {/* Stats dashboard */}
        <StatsBar stats={stats} />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <input
            type="search"
            placeholder="Search company or role…"
            value={search}
            onChange={handleSearch}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-56 focus:border-blue-500 focus:outline-none"
          />

          {/* Status chips */}
          <div className="flex gap-2">
            {STATUSES.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => toggleStatus(value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors border ${
                  filters.status === value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
              >
                {label}
                {stats.by_status[value] > 0 && (
                  <span className={`ml-1.5 ${filters.status === value ? 'text-blue-200' : 'text-gray-400'}`}>
                    {stats.by_status[value]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Clear + count */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-400 hover:text-gray-600 underline"
            >
              Clear
            </button>
          )}
          <span className="ml-auto text-sm text-gray-400">
            {applications.length} application{applications.length !== 1 ? 's' : ''}
            {hasFilters ? ' (filtered)' : ''}
          </span>
        </div>

        {/* Content */}
        {loading && (
          <div className="py-12 text-center text-sm text-gray-400">Loading…</div>
        )}
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {!loading && !error && (
          <ApplicationTable
            applications={applications}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}
      </main>

      <ApplicationModal
        open={modalOpen}
        initial={editing}
        onSave={handleSave}
        onClose={closeModal}
      />
    </div>
  )
}
