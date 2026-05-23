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
    // data-testid lets Playwright target the modal unambiguously
    <div data-testid="app-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
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

        {/* Form — labels connected to inputs via htmlFor/id for accessibility + Playwright */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="field-company" className="block text-sm font-medium text-gray-700">Company *</label>
              <input
                id="field-company"
                required
                value={form.company}
                onChange={e => set('company', e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="field-role" className="block text-sm font-medium text-gray-700">Role *</label>
              <input
                id="field-role"
                required
                value={form.role}
                onChange={e => set('role', e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="field-location" className="block text-sm font-medium text-gray-700">Location *</label>
              <input
                id="field-location"
                required
                placeholder="Toronto, ON"
                value={form.location}
                onChange={e => set('location', e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="field-status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="field-status"
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
              <label htmlFor="field-date" className="block text-sm font-medium text-gray-700">Date Applied *</label>
              <input
                id="field-date"
                required
                type="date"
                value={form.date_applied}
                onChange={e => set('date_applied', e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="field-url" className="block text-sm font-medium text-gray-700">Job URL</label>
              <input
                id="field-url"
                type="url"
                value={form.url ?? ''}
                onChange={e => set('url', e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="field-salary-min" className="block text-sm font-medium text-gray-700">Salary Min (CAD)</label>
              <input
                id="field-salary-min"
                type="number"
                min={0}
                value={form.salary_min ?? ''}
                onChange={e => set('salary_min', e.target.value ? Number(e.target.value) : undefined)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="field-salary-max" className="block text-sm font-medium text-gray-700">Salary Max (CAD)</label>
              <input
                id="field-salary-max"
                type="number"
                min={0}
                value={form.salary_max ?? ''}
                onChange={e => set('salary_max', e.target.value ? Number(e.target.value) : undefined)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="field-notes" className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              id="field-notes"
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
              data-testid="modal-submit"
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
