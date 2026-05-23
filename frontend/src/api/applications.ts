// src/api/applications.ts
import client from './client'
import type {
  Application,
  ApplicationCreate,
  ApplicationStats,
  ApplicationStatus,
  ApplicationUpdate,
} from './types'

export async function listApplications(params?: {
  status?: ApplicationStatus
  search?: string
}): Promise<Application[]> {
  const res = await client.get<Application[]>('', { params })
  return res.data
}

export async function createApplication(
  payload: ApplicationCreate,
): Promise<Application> {
  const res = await client.post<Application>('', payload)
  return res.data
}

export async function updateApplication(
  id: number,
  payload: ApplicationUpdate,
): Promise<Application> {
  const res = await client.put<Application>(`/${id}`, payload)
  return res.data
}

export async function deleteApplication(id: number): Promise<void> {
  await client.delete(`/${id}`)
}

export async function getStats(): Promise<ApplicationStats> {
  const res = await client.get<ApplicationStats>('/stats')
  return res.data
}
