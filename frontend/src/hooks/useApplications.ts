// src/hooks/useApplications.ts
import { useCallback, useEffect, useState } from 'react'
import {
  createApplication,
  deleteApplication,
  listApplications,
  updateApplication,
} from '../api/applications'
import type {
  Application,
  ApplicationCreate,
  ApplicationStatus,
} from '../api/types'

interface Filters {
  status?: ApplicationStatus
  search?: string
}

export function useApplications() {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({})

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listApplications(filters)
      setApplications(data)
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

  return { applications, loading, error, filters, setFilters, create, update, remove }
}
