// src/api/types.ts

export type ApplicationStatus =
  | 'applied'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'rejected'

export interface Application {
  id: number
  company: string
  role: string
  location: string
  status: ApplicationStatus
  date_applied: string
  url?: string
  notes?: string
  salary_min?: number
  salary_max?: number
  created_at: string
  updated_at: string
}

export interface ApplicationCreate {
  company: string
  role: string
  location: string
  status: ApplicationStatus
  date_applied: string
  url?: string
  notes?: string
  salary_min?: number
  salary_max?: number
}

export type ApplicationUpdate = Partial<ApplicationCreate>

export interface ApplicationStats {
  total: number
  by_status: Record<ApplicationStatus, number>
  response_rate: number
  active_pipeline: number
  offers: number
}
