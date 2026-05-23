// src/components/ApplicationTable.tsx
import type { Application } from '../api/types'
import StatusBadge from './StatusBadge'

interface Props {
  applications: Application[]
  onEdit: (app: Application) => void
  onDelete: (app: Application) => void
}

export default function ApplicationTable({ applications, onEdit, onDelete }: Props) {
  if (applications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center text-gray-400">
        No applications yet. Add your first one.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-4 py-3">Company</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Applied</th>
            <th className="px-4 py-3">Salary (CAD)</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {applications.map(app => (
            <tr key={app.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">
                {app.url ? (
                  <a
                    href={app.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600 hover:underline"
                  >
                    {app.company}
                  </a>
                ) : (
                  app.company
                )}
              </td>
              <td className="px-4 py-3 text-gray-700">{app.role}</td>
              <td className="px-4 py-3 text-gray-500">{app.location}</td>
              <td className="px-4 py-3">
                <StatusBadge status={app.status} />
              </td>
              <td className="px-4 py-3 text-gray-500">
                {new Date(app.date_applied).toLocaleDateString('en-CA')}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {app.salary_min && app.salary_max
                  ? `$${app.salary_min.toLocaleString()} – $${app.salary_max.toLocaleString()}`
                  : app.salary_min
                    ? `$${app.salary_min.toLocaleString()}+`
                    : '—'}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => onEdit(app)}
                    className="text-gray-400 hover:text-blue-600 transition-colors text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(app)}
                    className="text-gray-400 hover:text-red-600 transition-colors text-xs font-medium"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
