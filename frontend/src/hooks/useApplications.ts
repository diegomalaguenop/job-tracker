// src/hooks/useApplications.ts
import { useCallback, useEffect, useState } from 'react'
import {
  createApplication,
  deleteApplication,
  getStats,
  listApplications,
  updateApplication,
} from '../api/applications'
import type {
  Application,
  ApplicationCreate,
  ApplicationStats,
  ApplicationStatus,
} from '../api/types'

interface Filters {
  status?: ApplicationStatus
  search?: string
}

const emptyStats: ApplicationStats = {
  total: 0,
  by_status: { applied: 0, screening: 0, interview: 0, offer: 0, rejected: 0 },
  response_rate: 0,
  active_pipeline: 0,
  offers: 0,
}

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState<ApplicationStats>(emptyStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({})

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch both in parallel — stats always reflects full dataset, not filtered view
      const [data, statsData] = await Promise.all([
        listApplications(filters),
        getStats(),
      ])
      setApplications(data)
      setStats(statsData)
    } catch {
      setError('Failed to load applications.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  const create = async (payload: ApplicationCreate) => {
    await createApplication(payload)
    await load()
  }

  const update = async (id: number, payload: ApplicationCreate) => {
    await updateApplication(id, payload)
    await load()
  }

  const remove = async (id: number) => {
    await deleteApplication(id)
    await load()
  }

  return { applications, stats, loading, error, filters, setFilters, create, update, remove }
}
