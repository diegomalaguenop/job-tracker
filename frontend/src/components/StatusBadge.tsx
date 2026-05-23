// src/components/StatusBadge.tsx
import type { ApplicationStatus } from '../api/types'

const styles: Record<ApplicationStatus, string> = {
  applied:   'bg-blue-100 text-blue-800',
  screening: 'bg-yellow-100 text-yellow-800',
  interview: 'bg-amber-100 text-amber-800',
  offer:     'bg-green-100 text-green-800',
  rejected:  'bg-gray-100 text-gray-600',
}

const labels: Record<ApplicationStatus, string> = {
  applied:   'Applied',
  screening: 'Screening',
  interview: 'Interview',
  offer:     'Offer',
  rejected:  'Rejected',
}

interface Props {
  status: ApplicationStatus
}

export default function StatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}
