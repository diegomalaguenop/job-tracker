// src/App.tsx
import { useState } from 'react'
import { deleteApplication } from './api/applications'
import type { Application, ApplicationCreate, ApplicationStatus } from './api/types'
import ApplicationModal from './components/ApplicationModal'
import ApplicationTable from './components/ApplicationTable'
import StatusBadge from './components/StatusBadge'
import { useApplications } from './hooks/useApplications'

const STATUSES: ApplicationStatus[] = [
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
]

export default function App() {
  const { applications, loading, error, filters, setFilters, create, update, remove } =
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

  const handleSearch = (e: React.FormEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value
    setSearch(val)
    setFilters(f => ({ ...f, search: val || undefined }))
  }

  const handleStatusFilter = (status: ApplicationStatus | '') => {
    setFilters(f => ({ ...f, status: status || undefined }))
  }

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
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="search"
            placeholder="Search company or role…"
            value={search}
            onInput={handleSearch}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-56 focus:border-blue-500 focus:outline-none"
          />
          <select
            value={filters.status ?? ''}
            onChange={e => handleStatusFilter(e.target.value as ApplicationStatus | '')}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">All statuses</option>
            {STATUSES.map(s => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          {(filters.status || filters.search) && (
            <button
              onClick={() => { setFilters({}); setSearch('') }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear filters
            </button>
          )}
          <span className="ml-auto text-sm text-gray-500">
            {applications.length} application{applications.length !== 1 ? 's' : ''}
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
