// src/components/ApplicationModal.tsx
import { useEffect, useState } from 'react'
import type { Application, ApplicationCreate, ApplicationStatus } from '../api/types'

const STATUSES: ApplicationStatus[] = [
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
]

const today = () => new Date().toISOString().split('T')[0]

const emptyForm = (): ApplicationCreate => ({
  company: '',
  role: '',
  location: '',
  status: 'applied',
  date_applied: today(),
  url: '',
  notes: '',
  salary_min: undefined,
  salary_max: undefined,
})

interface Props {
  open: boolean
  initial?: Application | null
  onSave: (data: ApplicationCreate) => Promise<void>
  onClose: () => void
}

export default function ApplicationModal({ open, initial, onSave, onClose }: Props) {
  const [form, setForm] = useState<ApplicationCreate>(emptyForm())
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initial) {
      setForm({
        company: initial.company,
        role: initial.role,
        location: initial.location,
        status: initial.status,
        date_applied: initial.date_applied,
        url: initial.url ?? '',
        notes: initial.notes ?? '',
        salary_min: initial.salary_min ?? undefined,
        salary_max: initial.salary_max ?? undefined,
      })
    } else {
      setForm(emptyForm())
    }
    setError(null)
  }, [initial, open])

  if (!open) return null

  const set = <K extends keyof ApplicationCreate>(key: K, value: ApplicationCreate[K]) =>
    setForm(f => ({ ...f, [key]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSave(form)
      onClose()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {initial ? 'Edit Application' : 'New Application'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company *</label>
              <input
                required
                value={form.company}
                onChange={e => set('company', e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role *</label>
              <input
                required
                value={form.role}
                onChange={e => set('role', e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Location *</label>
              <input
                required
                placeholder="Toronto, ON"
                value={form.location}
                onChange={e => set('location', e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value as ApplicationStatus)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Date Applied *</label>
              <input
                required
                type="date"
                value={form.date_applied}
                onChange={e => set('date_applied', e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Job URL</label>
              <input
                type="url"
                value={form.url ?? ''}
                onChange={e => set('url', e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Salary Min (CAD)</label>
              <input
                type="number"
                min={0}
                value={form.salary_min ?? ''}
                onChange={e => set('salary_min', e.target.value ? Number(e.target.value) : undefined)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Salary Max (CAD)</label>
              <input
                type="number"
                min={0}
                value={form.salary_max ?? ''}
                onChange={e => set('salary_max', e.target.value ? Number(e.target.value) : undefined)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              rows={3}
              value={form.notes ?? ''}
              onChange={e => set('notes', e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving…' : initial ? 'Save changes' : 'Add application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
