// src/api/client.ts
// In dev: VITE_API_URL is unset → Vite proxy forwards /applications → localhost:8000
// In prod: VITE_API_URL = Railway backend URL → direct calls, no proxy
import axios from 'axios'

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? ''

const client = axios.create({
  baseURL: `${BASE}/applications`,
  headers: { 'Content-Type': 'application/json' },
})

export default client
